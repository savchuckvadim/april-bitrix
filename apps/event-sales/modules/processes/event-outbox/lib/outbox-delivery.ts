import type { EvFlowOperationStatus } from '@/modules/processes/event/model';
// Прямой путь, а не барель shared/metrics: врезка должна быть видна в
// импортах файла и подменяться тестом одной строкой.
import { countDeliveryAttempt } from '@/modules/shared/metrics/lib/business-metrics';

import {
    getDeliveryTargets,
    selectAllowedTargets,
    type DeliveryTarget,
    type DeliveryTargetResult,
} from './delivery-targets';
import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
    OUTBOX_ENVELOPE_VERSION,
    applyAttempt,
    applyDirectExecution,
    applyDirectIncomplete,
    claimEnvelope,
    isRetryableFailure,
    releaseEnvelopeLease,
    type OutboxAttempt,
    type OutboxDeferredStep,
    type OutboxEnvelope,
} from './outbox-envelope';
import {
    OUTBOX_LOCK_BUSY,
    createOutboxLease,
    getOutboxTabId,
    isLeaseAlive,
    isLeaseHeldByOther,
    withOperationLock,
    type OutboxLockManager,
} from './outbox-lock';
import {
    markDirectExecutionOutcome,
    markReportOutcome,
} from './report-outcome';
import { readOutboxEnvelope, writeOutboxEnvelope } from './outbox-store';

/**
 * Двигатель доставки конверта: лок → (клейм → цель → исход) с бэкоффом.
 * Общий для свежей отправки (enqueueAndDeliver) и дренажа (drainOutbox) —
 * машина одна, различаются только поводы её запустить.
 */

/**
 * Паузы сетевого бэкоффа внутри сессии: после 1-й ошибки ждём 2с, после
 * 2-й — 5с; 3-я ошибка сессию исчерпывает, конверт ждёт дренажа с
 * nextAttemptAt = +15с (те же константы видит и порог прямого пути в А6).
 */
export const OUTBOX_BACKOFF_DELAYS_MS: readonly number[] = [
    2_000, 5_000, 15_000,
];

/** Зависимости двигателя. Продовые дефолты; тесты инжектируют свои. */
export interface OutboxDeliveryDeps {
    targets?: DeliveryTarget[];
    now?: () => number;
    wait?: (ms: number) => Promise<void>;
    tabId?: string;
    /** Проброс в withOperationLock: null — «Web Locks нет», работаем на lease. */
    locks?: OutboxLockManager | null;
    /**
     * Конверт «в памяти» для сквозного режима хранилища (kind `none`):
     * запись ушла в никуда, но отправка обязана работать как сегодня —
     * двигатель ведёт машину состояний по этому экземпляру.
     */
    fallbackEnvelope?: OutboxEnvelope;
}

export type OutboxDeliverySkipReason =
    | 'lock'
    | 'lease'
    | 'backoff'
    | 'state'
    | 'version'
    | 'missing'
    | 'no-target';

/** Итог прогона двигателя по одному конверту. */
export type OutboxDeliverySummary =
    | {
          status: 'accepted';
          operationStatus?: EvFlowOperationStatus;
          detail?: string;
      }
    | { status: 'rejected'; detail?: string }
    | { status: 'exhausted' }
    | { status: 'skipped'; reason: OutboxDeliverySkipReason }
    | {
          /** А4: прямой исполнитель выполнил ядро отчёта в Битриксе сам. */
          status: 'executed-direct';
          /** delivered — хвоста нет; partial — deferred[] ждёт досылки (А5). */
          envelopeState:
              | typeof OUTBOX_ENVELOPE_STATE.delivered
              | typeof OUTBOX_ENVELOPE_STATE.partial;
          deferred: OutboxDeferredStep[];
          detail?: string;
      }
    | {
          /**
           * А4: пишущий батч ушёл, но обязательные команды не применились.
           * Конверт закрыт видимым провалом (`failed` без авторетраев) —
           * чинить его нечем: повтор заблокирует маркер, бэку исходный
           * payload слать нельзя.
           */
          status: 'direct-incomplete';
          /** Cmd-ключи неприменившихся команд — диагностика и интерфейс. */
          failedCommands: string[];
          deferred: OutboxDeferredStep[];
          detail?: string;
      };

const defaultWait = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Почему конверт сейчас доставлять нельзя (null — можно):
 * - `lease`   — им живо занята вкладка (delivering с живой арендой, либо
 *               сетевой failed под чужой живой арендой);
 * - `backoff` — сетевой failed, у которого nextAttemptAt ещё в будущем;
 * - `state`   — состояние не для доставки: delivered, partial (ядро
 *               исполнено напрямую — хвост дошлёт только эндпоинт А5,
 *               до него partial не кандидат ни дренажу, ни движку),
 *               отвергнутый failed (ждёт ручного повтора).
 * Версию схемы проверяет вызывающий: чужую версию не трогаем вовсе.
 */
export const getDeliverySkipReason = (
    envelope: OutboxEnvelope,
    now: number,
    tabId: string,
): Exclude<
    OutboxDeliverySkipReason,
    'lock' | 'version' | 'missing' | 'no-target'
> | null => {
    if (envelope.state === OUTBOX_ENVELOPE_STATE.pending) {
        return null;
    }

    if (envelope.state === OUTBOX_ENVELOPE_STATE.delivering) {
        // Живая аренда — вкладка работает или ждёт поллинг; протухла —
        // вкладка умерла, конверт можно перехватывать.
        return isLeaseAlive(envelope.lease, now) ? 'lease' : null;
    }

    if (envelope.state === OUTBOX_ENVELOPE_STATE.failed) {
        if (!isRetryableFailure(envelope)) {
            return 'state';
        }
        if (isLeaseHeldByOther(envelope.lease, now, tabId)) {
            return 'lease';
        }
        if ((envelope.nextAttemptAt ?? 0) > now) {
            return 'backoff';
        }
        return null;
    }

    return 'state';
};

/**
 * Обращение к цели — и ЕДИНСТВЕННАЯ точка учёта ПОПЫТОК.
 *
 * Исходов у движка семь, а веток, где они разбираются, — с десяток (первая
 * цель, фолбэк-пас, каждый статус отдельно). Считать в них поштучно значило
 * бы забыть половину при первой же правке, поэтому счётчик стоит там, где
 * исход РОЖДАЕТСЯ: сразу за ответом цели, до всякого разбора.
 *
 * ЧТО ИМЕННО ЗДЕСЬ СЧИТАЕТСЯ. Именно ПОПЫТКА, а не судьба отчёта: одна
 * сессия при молчащем бэке даёт три сетевые попытки плюс фолбэк-пас, а
 * дренаж повторяет то же самое каждую минуту — счётчик от этого растёт, и
 * это правильно, потому что его вопрос «сколько раз мы стучимся впустую».
 * Долю доставленных по нему считать нельзя; терминальную судьбу конверта
 * считает `markReportOutcome` (lib/report-outcome.ts) — ровно один раз на
 * конверт, в тех ветках ниже, где конверт закрывается насовсем.
 *
 * `unavailable` не считается намеренно: это не попытка доставки, а «цель
 * пропущена как неготовая» (допуск прямого пути не пройден, зеркало не
 * подключено). Учтённый как попытка, он раздул бы график от одного лишь
 * наличия отключённой цели в реестре.
 *
 * Метрика стоит ПОСЛЕ ответа и НЕ в try: цель уже вернула результат, а
 * `collect` не бросает по контракту сборщика. Брошенное самой целью
 * исключение проходит мимо счётчика ровно как раньше — движок ловит его
 * своими средствами, поведение не меняется.
 */
const deliverToTarget = async (
    target: DeliveryTarget,
    envelope: OutboxEnvelope,
): Promise<DeliveryTargetResult> => {
    const result = await target.deliver(envelope);

    if (result.outcome !== OUTBOX_DELIVERY_OUTCOME.unavailable) {
        countDeliveryAttempt({
            outcome: result.outcome,
            target: target.id,
            domain: envelope.domain,
        });
    }

    return result;
};

/** Первая цель, которая не ответила `unavailable`. Все прочие — мимо. */
const pickDeliveryTarget = async (
    envelope: OutboxEnvelope,
    targets: DeliveryTarget[],
): Promise<{
    target: DeliveryTarget;
    result: DeliveryTargetResult;
    /** Позиция в реестре — фолбэк-пас пойдёт по целям ПОСЛЕ этой. */
    index: number;
} | null> => {
    for (const [index, target] of targets.entries()) {
        const result = await deliverToTarget(target, envelope);

        if (result.outcome !== OUTBOX_DELIVERY_OUTCOME.unavailable) {
            return { target, result, index };
        }
    }

    return null;
};

/** Состав хвоста для лога: side-flow различаем по потоку (zpr / pres). */
const describeDeferredTail = (steps: OutboxDeferredStep[]): string =>
    steps.length === 0
        ? 'пусто'
        : steps
              .map(step =>
                  step.kind === 'side-flow'
                      ? `${step.kind}:${step.flow}`
                      : step.kind,
              )
              .join(', ');

/**
 * Перенести в конверт отметку «прямой пишущий батч МОГ уйти», если цель её
 * вернула. Запись исхода идёт из ЭКЗЕМПЛЯРА В ПАМЯТИ, а отметку прямой путь
 * положил прямо в хранилище — без переноса следующая же запись затёрла бы
 * её, и дренаж вернул бы конверту primary с исходным payload.
 */
const withDirectAttempt = (
    envelope: OutboxEnvelope,
    result: DeliveryTargetResult,
): OutboxEnvelope =>
    result.directAttempted
        ? { ...envelope, directAttempted: result.directAttempted }
        : envelope;

/** Итог по конверту, закрытому applyDirectExecution (delivered | partial). */
const summarizeDirectExecution = (
    envelope: OutboxEnvelope,
    detail?: string,
): OutboxDeliverySummary => {
    const deferred = envelope.deferred ?? [];
    const envelopeState =
        envelope.state === OUTBOX_ENVELOPE_STATE.partial
            ? OUTBOX_ENVELOPE_STATE.partial
            : OUTBOX_ENVELOPE_STATE.delivered;

    if (envelopeState === OUTBOX_ENVELOPE_STATE.partial) {
        // Единственный честный след объёма проблемы до А5: хвост НИКУДА не
        // уедет, пока нет POST /flow/deferred, — по каждому такому отчёту
        // нет KPI-записи, движений сделок и элементов смартов с ответами
        // анкеты. Владельцу важен именно СОСТАВ хвоста, а не сам факт:
        // warn, потому что это накопительный долг, а не рядовое событие.
        console.warn(
            `[event-outbox] конверт ${envelope.operationId} закрыт как partial: ` +
                `служебная часть не проведена — ${describeDeferredTail(deferred)} ` +
                '(досылка появится с эндпоинтом А5)',
        );
    }

    return {
        status: 'executed-direct',
        envelopeState,
        deferred,
        detail,
    };
};

/**
 * Закрыть конверт НЕПОЛНЫМ прямым исполнением (А4): батч ушёл, часть
 * обязательных команд не применилась. Общий кусок обоих путей движка
 * (первая цель и фолбэк-пас) — конверт получает `failed` без авторетраев,
 * состав упавших команд и запрет primary навсегда.
 *
 * Лог — error, а не warn: это не накопительный долг вроде partial, а
 * отчёт, проведённый НЕ ЦЕЛИКОМ, без единого способа доисполнения.
 */
const closeDirectIncomplete = async (params: {
    envelope: OutboxEnvelope;
    targetId: string;
    result: DeliveryTargetResult;
    now: () => number;
    persist: (envelope: OutboxEnvelope) => Promise<void>;
}): Promise<OutboxDeliverySummary> => {
    const { envelope, targetId, result, now, persist } = params;
    const failedCommands = result.directIncomplete?.failedCommands ?? [];
    const deferred = result.directIncomplete?.deferred ?? [];
    // Терминал: конверт закрыт видимым провалом и доисполнить его нечем —
    // судьба отчёта решена здесь и больше не изменится.
    const final = markReportOutcome(
        applyDirectIncomplete(envelope, {
            targetId,
            at: now(),
            failedCommands,
            deferred,
            portalSnapshotAt: result.directIncomplete?.portalSnapshotAt ?? null,
            detail: result.detail,
        }),
        'incomplete',
    );

    await persist(final);
    console.error(
        `[event-outbox] конверт ${final.operationId} проведён НЕ ЦЕЛИКОМ: ` +
            `не применились команды — ${failedCommands.join(', ') || 'состав неизвестен'}; ` +
            'повторить нечем (маркер в задаче блокирует повтор, бэку исходный ' +
            'payload слать нельзя) — проверять карточку клиента вручную',
    );

    return {
        status: 'direct-incomplete',
        failedCommands,
        deferred,
        detail: result.detail,
    };
};

/**
 * Фолбэк-пас после исчерпания сессионного бэкоффа: порог «бэк молчит» из
 * плана (три сетевые POST-попытки; недоступность статус-эндпоинта сверяет
 * сам допуск прямого пути) пройден — очередь целей ПОСЛЕ давшей сетевые
 * ошибки, сегодня это прямой исполнитель direct-bitrix.
 *
 * Вход: `envelope` — в памяти уже `failed` с записанной последней сетевой
 * попыткой; в ХРАНИЛИЩЕ конверт всё ещё delivering-клейм этого прогона с
 * живым lease — чужие вкладки его не подберут, а упади мы внутри цели,
 * lease протухнет в руки дренажу (маркер защитит от дубля). Исход решает
 * ПЕРВАЯ цель, не ответившая `unavailable`; остальные подождут дренажа.
 * null — фолбэка не случилось, вызывающий закрывает сессию как exhausted.
 */
const runExhaustionFallback = async (params: {
    envelope: OutboxEnvelope;
    targets: DeliveryTarget[];
    now: () => number;
    tabId: string;
    persist: (envelope: OutboxEnvelope) => Promise<void>;
}): Promise<OutboxDeliverySummary | null> => {
    const { envelope, now, tabId, persist } = params;

    for (const target of params.targets) {
        const result = await deliverToTarget(target, envelope);

        if (result.outcome === OUTBOX_DELIVERY_OUTCOME.unavailable) {
            continue; // допуск не пройден / цель не подключена — попытки нет
        }

        // Попытка идёт через клейм: failed → delivering (машина переходов).
        const reclaimed = claimEnvelope(
            withDirectAttempt(envelope, result),
            createOutboxLease(now(), tabId),
            now(),
        );

        if (result.outcome === OUTBOX_DELIVERY_OUTCOME.executedDirect) {
            // Терминал только при пустом хвосте: partial ждёт досылки, и его
            // исход решится, когда хвост доедет (см. markDirectExecutionOutcome).
            const final = markDirectExecutionOutcome(
                applyDirectExecution(reclaimed, {
                    targetId: target.id,
                    at: now(),
                    deferred: result.direct?.deferred ?? [],
                    portalSnapshotAt: result.direct?.portalSnapshotAt ?? null,
                    detail: result.detail,
                }),
            );

            await persist(final);

            return summarizeDirectExecution(final, result.detail);
        }

        if (result.outcome === OUTBOX_DELIVERY_OUTCOME.directIncomplete) {
            return closeDirectIncomplete({
                envelope: reclaimed,
                targetId: target.id,
                result,
                now,
                persist,
            });
        }

        const attempt: OutboxAttempt = {
            targetId: target.id,
            at: now(),
            outcome: result.outcome,
            detail: result.detail,
        };

        if (result.outcome === OUTBOX_DELIVERY_OUTCOME.accepted) {
            // Запасная цель приняла операцию (зеркальный бэк будущего): как
            // у primary — конверт delivering, исход отдаст поллинг статуса.
            await persist(applyAttempt(reclaimed, attempt, null));

            return {
                status: 'accepted',
                operationStatus: result.operationStatus,
                detail: result.detail,
            };
        }

        if (result.outcome === OUTBOX_DELIVERY_OUTCOME.rejected) {
            // Терминал: отвергнутый конверт авторетраев не получает, дальше
            // его двигает только человек кнопкой «Повторить» (это уже новая
            // отправка со своим исходом — см. mergeRequeuedEnvelope).
            await persist(
                markReportOutcome(
                    releaseEnvelopeLease(
                        applyAttempt(reclaimed, attempt, null),
                    ),
                    'rejected',
                ),
            );

            return { status: 'rejected', detail: result.detail };
        }

        // network-error: прямой путь провален (или запасная цель сетево
        // мертва) — конверт остаётся failed-ретраебельным с тем же горизонтом
        // дренажа, что у исчерпанной сети; primary попробует снова.
        const drainDelay =
            OUTBOX_BACKOFF_DELAYS_MS[OUTBOX_BACKOFF_DELAYS_MS.length - 1]!;

        await persist(
            releaseEnvelopeLease(
                applyAttempt(reclaimed, attempt, attempt.at + drainDelay),
            ),
        );

        return { status: 'exhausted' };
    }

    return null;
};

/**
 * Доставка одного конверта: под локом операции — до `OUTBOX_BACKOFF_DELAYS_MS
 * .length` попыток с паузами бэкоффа.
 *
 * Каждая попытка: свежее чтение конверта → проверка «можно ли» → клейм
 * (`delivering` + продлённый lease, ЗАПИСАН до обращения к цели) → цель →
 * запись исхода. `accepted` оставляет `delivering`: подтверждение отдаст
 * существующий поллинг статуса. `rejected` — `failed` без ретраев. Сетевая
 * ошибка — `failed` c nextAttemptAt; исчерпали паузы — конверт ждёт дренажа.
 */
export const deliverOutboxEnvelope = async (
    domain: string,
    operationId: string,
    deps: OutboxDeliveryDeps = {},
): Promise<OutboxDeliverySummary> => {
    const targets = deps.targets ?? getDeliveryTargets();
    const now = deps.now ?? Date.now;
    const wait = deps.wait ?? defaultWait;
    const tabId = deps.tabId ?? getOutboxTabId();
    // Хранилища может не быть (kind `none`): тогда каждое чтение вернёт null,
    // и машина работает по последнему экземпляру в памяти.
    let memory: OutboxEnvelope | null = deps.fallbackEnvelope ?? null;

    const readFresh = async (): Promise<OutboxEnvelope | null> => {
        const stored = await readOutboxEnvelope(domain, operationId);

        if (stored) {
            memory = stored;
            return stored;
        }

        return memory;
    };
    const persist = async (envelope: OutboxEnvelope): Promise<void> => {
        memory = envelope;
        await writeOutboxEnvelope(envelope);
    };

    const outcome = await withOperationLock(
        operationId,
        async (): Promise<OutboxDeliverySummary> => {
            for (let attemptIndex = 0; ; attemptIndex += 1) {
                const envelope = await readFresh();

                if (!envelope) {
                    return { status: 'skipped', reason: 'missing' };
                }
                if (envelope.v !== OUTBOX_ENVELOPE_VERSION) {
                    return { status: 'skipped', reason: 'version' };
                }
                const skipReason = getDeliverySkipReason(
                    envelope,
                    now(),
                    tabId,
                );

                if (skipReason) {
                    return { status: 'skipped', reason: skipReason };
                }

                // Конверту, чей прямой пишущий батч мог уйти в Битрикс,
                // primary запрещён: исходный payload исполнил бы отчёт
                // второй раз целиком (см. isPrimaryForbidden).
                const allowed = selectAllowedTargets(envelope, targets);

                // Клейм записывается ДО обращения к цели: другие вкладки
                // видят живой lease, а упади мы прямо на POST — конверт
                // останется delivering и протухнет в руки дренажу.
                const claimed = claimEnvelope(
                    envelope,
                    createOutboxLease(now(), tabId),
                    now(),
                );

                await persist(claimed);

                const picked = await pickDeliveryTarget(claimed, allowed);

                if (!picked) {
                    // Все цели unavailable: клейм откатываем как не бывший —
                    // попыткой это не считается.
                    await persist(envelope);
                    return { status: 'skipped', reason: 'no-target' };
                }

                // Отметка прямого пути из исхода цели — в конверт: иначе её
                // затрёт запись исхода из памяти (см. withDirectAttempt).
                const marked = withDirectAttempt(claimed, picked.result);

                if (
                    picked.result.outcome ===
                    OUTBOX_DELIVERY_OUTCOME.executedDirect
                ) {
                    // Прямое исполнение (А4) первой же целью — реестр без
                    // primary (тесты, будущая политика по режиму встройки
                    // А5.5): хвост deferred решает delivered | partial.
                    const final = markDirectExecutionOutcome(
                        applyDirectExecution(marked, {
                            targetId: picked.target.id,
                            at: now(),
                            deferred: picked.result.direct?.deferred ?? [],
                            portalSnapshotAt:
                                picked.result.direct?.portalSnapshotAt ?? null,
                            detail: picked.result.detail,
                        }),
                    );

                    await persist(final);
                    return summarizeDirectExecution(
                        final,
                        picked.result.detail,
                    );
                }

                if (
                    picked.result.outcome ===
                    OUTBOX_DELIVERY_OUTCOME.directIncomplete
                ) {
                    // Батч ушёл, обязательная часть не применилась: конверт
                    // закрывается видимым провалом — доисполнить его нечем.
                    return closeDirectIncomplete({
                        envelope: marked,
                        targetId: picked.target.id,
                        result: picked.result,
                        now,
                        persist,
                    });
                }

                const attempt: OutboxAttempt = {
                    targetId: picked.target.id,
                    at: now(),
                    outcome: picked.result.outcome,
                    detail: picked.result.detail,
                };

                if (attempt.outcome === OUTBOX_DELIVERY_OUTCOME.accepted) {
                    // Lease оставляем живым: ближайшую минуту исходом
                    // занимается поллинг этой вкладки; умрёт — протухнет.
                    await persist(applyAttempt(marked, attempt, null));
                    return {
                        status: 'accepted',
                        operationStatus: picked.result.operationStatus,
                        detail: picked.result.detail,
                    };
                }

                if (attempt.outcome === OUTBOX_DELIVERY_OUTCOME.rejected) {
                    // Терминал: авторетраев у отвергнутого конверта нет.
                    await persist(
                        markReportOutcome(
                            releaseEnvelopeLease(
                                applyAttempt(marked, attempt, null),
                            ),
                            'rejected',
                        ),
                    );
                    return { status: 'rejected', detail: picked.result.detail };
                }

                // network-error: бэкофф в сессии, дальше конверт ждёт дренажа.
                const delayIndex = Math.min(
                    attemptIndex,
                    OUTBOX_BACKOFF_DELAYS_MS.length - 1,
                );
                const delay = OUTBOX_BACKOFF_DELAYS_MS[delayIndex]!;
                const isLastInSession =
                    attemptIndex >= OUTBOX_BACKOFF_DELAYS_MS.length - 1;
                const afterNetwork = applyAttempt(
                    marked,
                    attempt,
                    attempt.at + delay,
                );

                if (!isLastInSession) {
                    await persist(afterNetwork);
                    await wait(delay);
                    continue;
                }

                // Сессия исчерпана — порог «бэк молчит» пройден: фолбэк-пас
                // по целям после давшей сетевые ошибки (прямой путь А4).
                // Хранилище всё ещё держит delivering-клейм этого прогона.
                const fallback = await runExhaustionFallback({
                    envelope: afterNetwork,
                    targets: allowed.slice(picked.index + 1),
                    now,
                    tabId,
                    persist,
                });

                if (fallback) {
                    return fallback;
                }

                await persist(releaseEnvelopeLease(afterNetwork));
                return { status: 'exhausted' };
            }
        },
        { locks: deps.locks },
    );

    return outcome === OUTBOX_LOCK_BUSY
        ? { status: 'skipped', reason: 'lock' }
        : outcome;
};
