import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
// Прямой путь, а не барель shared/metrics: врезка должна быть видна в
// импортах файла и подменяться тестом одной строкой.
import { countDeliveryAttempt } from '@/modules/shared/metrics/lib/business-metrics';

import { EV_FLOW_OPERATION_STATUS } from '@/modules/processes/event/model';

import {
    PRIMARY_BACKEND_TARGET_ID,
    isPrimaryForbidden,
} from '../lib/delivery-targets';
import {
    DeferredTailHelper,
    deferredStepKey,
    type DeferredTailRequest,
    type DeferredTailResponse,
} from '../lib/api/deferred-helper';
import {
    OUTBOX_ENVELOPE_STATE,
    OUTBOX_ENVELOPE_VERSION,
    applyDeferredTail,
    hasAcceptedAttempt,
    isIncompleteEnvelope,
    isTailPendingEnvelope,
    isUndeliveredEnvelope,
    type OutboxDeferredStep,
    type OutboxEnvelope,
} from '../lib/outbox-envelope';
import {
    deliverOutboxEnvelope,
    getDeliverySkipReason,
    type OutboxDeliveryDeps,
    type OutboxDeliverySummary,
} from '../lib/outbox-delivery';
import { getOutboxTabId } from '../lib/outbox-lock';
import {
    isReportOutcomeCounted,
    markReportOutcome,
} from '../lib/report-outcome';
import {
    OUTBOX_DOMAIN_CAP,
    listOutboxEnvelopes,
    planOutboxRetention,
    readOutboxEnvelope,
    removeOutboxEnvelope,
    writeOutboxEnvelope,
} from '../lib/outbox-store';
import { outboxActions } from './OutboxSlice';
import {
    getWiredDeliveryTargets,
    markDelivered,
    markFailed,
} from './OutboxThunk';

/**
 * Дренаж outbox: досылка недоставленных конвертов домена.
 *
 * Поводы запустить (регистрирует OutboxDrainListener): конец инициализации
 * fire-and-forget, `window 'online'` и собственный таймер 60с. Таймер держат
 * два конца: конец прогона перезаряжает его, пока в домене остаются
 * конверты, с которыми дренаж РЕАЛЬНО может что-то сделать (терминальные в
 * этот счёт не идут, а partial с хвостом — идут: его возит пас А5), а
 * появление недоставленных в зеркале
 * взводит его заново (armOutboxDrainTimer) — конверт, исчерпавший бэкофф
 * при живой сети (лёг бэк, событие 'online' не случится), без этого ждал бы
 * перезапуска фрейма.
 * Прогон строго последовательный: конверты идут по одному (общий cmdBatch и
 * бэк не любят параллель), каждый — под локом операции.
 */

/** Пауза между фоновыми прогонами, пока есть недоставленные. */
export const OUTBOX_DRAIN_INTERVAL_MS = 60_000;

let drainInFlight = false;
let drainTimer: ReturnType<typeof setTimeout> | null = null;

/** Остановить фоновый таймер (тесты, размонтирование приложения). */
export const stopOutboxDrainTimer = (): void => {
    if (drainTimer) {
        clearTimeout(drainTimer);
        drainTimer = null;
    }
};

/** Взвод таймера без сторожей — зовут только дренаж и armOutboxDrainTimer. */
const scheduleDrainTimer = (
    dispatch: AppDispatch,
    options: DrainOutboxOptions,
): void => {
    drainTimer = setTimeout(() => {
        drainTimer = null;
        void dispatch(drainOutbox(options));
    }, OUTBOX_DRAIN_INTERVAL_MS);
};

/**
 * Взвести таймер дренажа, не дожидаясь прогона. Повод — в домене появились
 * недоставленные конверты (листенер setUndelivered): у exhausted-исхода
 * enqueueAndDeliver при живой сети другого внутрисессионного повода нет.
 * Таймер уже взведён — второго не нужно; прогон идёт — перезарядкой владеет
 * его конец (там и решится, есть ли ради чего будить дренаж дальше).
 * Взвод здесь идёт по счётчику недоставленных, то есть «только-partial»
 * бэклог тоже разбудит дренаж один раз — но перезаряжать себя такой прогон
 * уже не станет, вечного 60с-цикла не будет.
 */
export const armOutboxDrainTimer = (
    dispatch: AppDispatch,
    options: DrainOutboxOptions = {},
): void => {
    if (drainTimer || drainInFlight) {
        return;
    }
    scheduleDrainTimer(dispatch, options);
};

export interface DrainOutboxOptions {
    /** Инжекция для тестов (цели, время, паузы, лок, tabId). */
    deps?: OutboxDeliveryDeps;
    /** false — не перезаряжать таймер 60с (тесты). По умолчанию заряжается. */
    rearm?: boolean;
    /**
     * Шов интеграции: конверт принят primary, но исход ещё не известен —
     * сюда FlowWatch-интеграция подключит СУЩЕСТВУЮЩИЙ поллинг статуса,
     * который и погасит конверт (markDelivered/markFailed).
     */
    onAccepted?: (
        envelope: OutboxEnvelope,
        summary: Extract<OutboxDeliverySummary, { status: 'accepted' }>,
    ) => void;
    /**
     * Терминальный успех из дренажа: конверт погашен (после markDelivered) —
     * повторный POST вернул done либо сверка статуса подтвердила его. Шов
     * для листенера: синхронизировать flowStatus ТЕКУЩЕЙ отправки — иначе
     * финиш «сохранено, отправим автоматически» (QUEUED) застыл бы навсегда,
     * хотя операция уже выполнена. Никакого cleanEvent/reloadApp из дренажа
     * — см. buildDrainOptions в OutboxDrainListener.
     */
    onDelivered?: (envelope: OutboxEnvelope) => void;
    /**
     * Терминальный провал из дренажа: конверт помечен отказом (после
     * markFailed) — бэкенд сообщил failed по этой операции.
     */
    onFailedTerminal?: (envelope: OutboxEnvelope, detail?: string) => void;
    /**
     * Дренаж исполнил конверт НАПРЯМУЮ (А4): бэк молчал, прямой путь
     * выполнил ядро — конверт уже delivered либо partial (движок закрыл его
     * сам, markDelivered не нужен). Шов для листенера: честная смена стадии
     * ТЕКУЩЕЙ отправки (DONE, при хвосте — PARTIAL), без cleanEvent и
     * reloadApp — прогон фоновый.
     */
    onExecutedDirect?: (
        envelope: OutboxEnvelope,
        summary: Extract<OutboxDeliverySummary, { status: 'executed-direct' }>,
    ) => void;
    /**
     * Дренаж провёл конверт НЕ ЦЕЛИКОМ (А4): пишущий батч ушёл, но
     * обязательные команды не применились. Конверт уже закрыт видимым
     * провалом (`failed` без авторетраев) — шов для листенера: показать
     * честную стадию ТЕКУЩЕЙ отправки вместо «отчёт отправлен».
     */
    onDirectIncomplete?: (
        envelope: OutboxEnvelope,
        summary: Extract<
            OutboxDeliverySummary,
            { status: 'direct-incomplete' }
        >,
    ) => void;
    /**
     * Хвост досылки уехал на бэк (А5) и конверт погашен целиком: служебная
     * часть (KPI, движения сделок, элементы смартов) проведена. Шов для
     * листенера — снять со стадии ТЕКУЩЕЙ отправки пометку «служебная часть
     * не проведена».
     */
    onTailDelivered?: (envelope: OutboxEnvelope) => void;
    /** Отправитель хвоста; тесты подменяют своим. */
    sendDeferredTail?: (
        request: DeferredTailRequest,
    ) => Promise<DeferredTailResponse>;
}

/** Итоги паса досылки хвоста (А5) за один прогон — для лога прогона. */
interface DrainTailStats {
    /** Хвост уехал целиком, конверт погашен. */
    done: number;
    /** Часть шагов исполнена — хвост сузился, конверт остался partial. */
    narrowed: number;
    /** Сервер недоступен либо ответил ошибкой — хвост остался как был. */
    failed: number;
}

/** Итоги основного цикла за один прогон — для лога прогона. */
interface DrainRunStats {
    delivered: number;
    failed: number;
    /** Принято бэком, исход отдан поллингу статуса. */
    accepted: number;
    /** Ядро исполнено напрямую в Битриксе (А4). */
    direct: number;
    /** Проведено НЕ ЦЕЛИКОМ — конверт закрыт видимым провалом. */
    incomplete: number;
    /** Бэк жив и операция ещё в работе — конверт не трогали. */
    inProgress: number;
    /** Доставка не состоялась (лок/аренда/цели/бэкофф) — по причинам. */
    skipped: Record<string, number>;
}

/** «lease 2, backoff 1» — состав пропусков одной строкой; пусто — ''. */
const describeSkips = (skipped: Record<string, number>): string =>
    Object.entries(skipped)
        .map(([reason, count]) => `${reason} ${count}`)
        .join(', ');

/** Счётчик причины пропуска: одна строка вместо ветвлений по месту. */
const countSkip = (stats: DrainRunStats, reason: string): void => {
    stats.skipped[reason] = (stats.skipped[reason] ?? 0) + 1;
};

/**
 * Досылка хвоста прямого исполнения (А5) — отдельный пас после основного.
 *
 * Отдельный, потому что это ДРУГАЯ работа: основной цикл возит ИСХОДНЫЙ
 * payload на `/flow`, а здесь уезжают только семантические шаги на
 * `/flow/deferred` — тот единственный канал, которым служебную часть можно
 * провести, не рискуя вторым исполнением отчёта.
 *
 * Берутся конверты `partial` с непустым хвостом. Неполное прямое исполнение
 * (`direct-incomplete`) сюда НЕ попадает: у такого отчёта ядро легло не
 * целиком, и досылать поверх него KPI и движения сделок — решение владельца,
 * а не фонового таймера (хвост в конверте сохранён, см. isTailPendingEnvelope).
 *
 * Бэк отвечает исходом каждого шага: `completed` гасит конверт целиком,
 * иначе хвост сужается до неисполненного. Сервер недоступен — тихо выходим:
 * ровно тот случай, ради которого хвост и лежит в конверте.
 */
const runDeferredTailPass = async (
    pending: OutboxEnvelope[],
    domain: string,
    at: number,
    options: DrainOutboxOptions,
): Promise<DrainTailStats> => {
    const stats: DrainTailStats = { done: 0, narrowed: 0, failed: 0 };

    if (pending.length === 0) return stats;

    const send =
        options.sendDeferredTail ??
        (request => new DeferredTailHelper().send(request));

    for (const envelope of pending) {
        const steps = envelope.deferred ?? [];

        try {
            const response = await send({
                domain,
                operationId: envelope.operationId,
                payload: envelope.payload,
                steps,
            });
            const stillPending = pickPendingSteps(steps, response.pending);
            const applied = applyDeferredTail(envelope, {
                at,
                completed: response.completed,
                pending: stillPending,
            });
            // Хвост доехал целиком — только СЕЙЧАС отчёт проведён по-настоящему
            // (KPI, движения сделок, элементы смартов). Прямое исполнение
            // ядра терминальным исходом такой конверт не делало: он оставался
            // partial и ждал этого паса.
            const updated =
                applied.state === OUTBOX_ENVELOPE_STATE.delivered
                    ? markReportOutcome(applied, 'delivered')
                    : applied;

            await writeOutboxEnvelope(updated);

            if (response.warnings.length > 0) {
                console.warn(
                    `[event-outbox] досылка ${envelope.operationId}: ` +
                        response.warnings.join('; '),
                );
            }
            if (updated.state === OUTBOX_ENVELOPE_STATE.delivered) {
                stats.done += 1;
                options.onTailDelivered?.(updated);
            } else {
                stats.narrowed += 1;
            }
        } catch (error) {
            stats.failed += 1;
            // Бэк всё ещё недоступен (или ответил ошибкой) — хвост остаётся
            // в конверте до следующего прогона. Ни состояния, ни состава
            // шагов не трогаем: повтор шага сервер гасит своим дедупом.
            console.warn(
                `[event-outbox] досылка ${envelope.operationId} не удалась: ` +
                    (error instanceof Error ? error.message : String(error)),
            );
        }
    }

    return stats;
};

/**
 * Шаги, оставшиеся неисполненными: сервер называет их своими ключами
 * (`kind`, у сайд-flow `side-flow:{поток}`), а конверт хранит сами шаги —
 * с ними и поедет следующая попытка.
 */
const pickPendingSteps = (
    steps: OutboxDeferredStep[],
    pendingKeys: string[],
): OutboxDeferredStep[] => {
    const keys = new Set(pendingKeys);

    return steps.filter(step => keys.has(deferredStepKey(step)));
};

/**
 * Один прогон дренажа: уборка → отбор кандидатов → последовательная доставка.
 *
 * Кандидаты основного цикла (по плану А3): `pending`, `delivering` с
 * протухшим lease, сетевые `failed` с nextAttemptAt<=now. Отвергнутые
 * failed, delivered, partial и конверты чужой версии схемы им не трогаются:
 * слать ИСХОДНЫЙ payload на primary после прямого исполнения НЕЛЬЗЯ — бэк
 * его не видел и выполнил бы flow целиком второй раз. Служебный хвост
 * partial-конвертов возит отдельный пас (`runDeferredTailPass`, А5) на
 * `POST /flow/deferred` — единственный безопасный канал для него.
 * Кандидат, который `delivering` или несёт accepted в истории попыток,
 * перед досылкой сверяется со статусом операции — см. комментарий в цикле.
 *
 * Повторный POST уже принятой операции идемпотентен и возвращает её ТЕКУЩИЙ
 * статус — терминальный `done`/`failed` из ответа гасит конверт тем же
 * каналом, что и поллинг, просто без ожидания.
 */
export const drainOutbox =
    (options: DrainOutboxOptions = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        if (drainInFlight) {
            return; // прогон уже идёт — параллельный дренаж запрещён
        }
        drainInFlight = true;
        // Взвели ли мы флаг «прогон идёт» (только у прогона с работой) —
        // ровно столько же раз его надо снять, что бы ни случилось внутри.
        let drainAnnounced = false;

        try {
            const domain = getState().app.domain;

            if (!domain) {
                return; // домен ещё не известен — дренить нечего
            }
            const now = options.deps?.now ?? Date.now;
            const tabId = options.deps?.tabId ?? getOutboxTabId();
            const envelopes = await listOutboxEnvelopes(domain);

            // Уборка: терминальные (delivered / отвергнутые failed) старше
            // 24ч и старейшие терминальные сверх капа.
            const retention = planOutboxRetention(envelopes, now());

            for (const operationId of retention.removeOperationIds) {
                await removeOutboxEnvelope(domain, operationId);
            }
            if (retention.overflow > 0) {
                console.warn(
                    `[event-outbox] в домене ${domain} конвертов больше капа ` +
                        `(${OUTBOX_DOMAIN_CAP}), лишние недоставленные не удаляются: ${retention.overflow}`,
                );
            }

            const removed = new Set(retention.removeOperationIds);
            const live = envelopes.filter(
                envelope => !removed.has(envelope.operationId),
            );
            const stats: DrainRunStats = {
                delivered: 0,
                failed: 0,
                accepted: 0,
                direct: 0,
                incomplete: 0,
                inProgress: 0,
                skipped: {},
            };
            const known = live.filter(
                envelope => envelope.v === OUTBOX_ENVELOPE_VERSION,
            );

            if (known.length < live.length) {
                countSkip(stats, 'version');
            }
            const candidates = known
                // partial отсеивается здесь же (skip reason `state`) — см.
                // констрейнт А5 в докблоке drainOutbox.
                .filter(envelope => {
                    const reason = getDeliverySkipReason(
                        envelope,
                        now(),
                        tabId,
                    );

                    if (reason) {
                        countSkip(stats, reason);
                        return false;
                    }

                    return true;
                })
                .sort((a, b) => a.createdAt - b.createdAt);
            // Хвост (А5) считаем здесь же: по нему решается, есть ли у
            // прогона работа вообще — и он же попадает в лог старта.
            const tailPending = known.filter(isTailPendingEnvelope);

            if (candidates.length > 0 || tailPending.length > 0) {
                // Живое зеркало: счётчики публикуются в КОНЦЕ прогона, и до
                // тех пор единственный честный сигнал «система везёт» —
                // этот флаг. Взводим только у прогона с работой, иначе
                // полоска мигала бы на каждом холостом.
                drainAnnounced = true;
                dispatch(outboxActions.setDraining(true));
                console.log(
                    `[event-outbox] дренаж ${domain}: конвертов ${envelopes.length}, ` +
                        `к отправке ${candidates.length}, к досылке хвоста ${tailPending.length}` +
                        (Object.keys(stats.skipped).length > 0
                            ? `, пропущено (${describeSkips(stats.skipped)})`
                            : ''),
                );
            }
            const targets =
                options.deps?.targets ??
                getWiredDeliveryTargets(
                    dispatch,
                    getState().app.bitrix?.placement?.placement,
                );
            const checkStatus = targets.find(
                target => target.checkStatus,
            )?.checkStatus;

            for (const candidate of candidates) {
                // ПЕРЕД повторной доставкой сверяемся с существующим
                // GET /flow/status — тем же каналом, каким поллинг FlowWatch
                // узнаёт исход. Сверки заслуживают два случая: `delivering`
                // с протухшим lease (POST могла успеть принять умершая
                // вкладка) и конверт с accepted в истории попыток — повтор
                // «Повторить» сливает историю (mergeRequeuedEnvelope), и
                // улика переживает сетевой провал ретрая: слепой POST после
                // истечения статуса выполнил бы flow второй раз.
                //
                // Конверт, чей ПРЯМОЙ пишущий батч мог уйти в Битрикс
                // (directAttempted / executedDirect), из сверки исключён:
                // primary ему запрещён в любом случае, а «бэк недоступен»
                // тут привело бы к `continue` — конверт навсегда остался бы
                // без маркер-проверки, которой владеет прямая цель.
                if (
                    !isPrimaryForbidden(candidate) &&
                    (candidate.state === OUTBOX_ENVELOPE_STATE.delivering ||
                        hasAcceptedAttempt(candidate)) &&
                    checkStatus
                ) {
                    const check = await checkStatus(
                        candidate.operationId,
                        domain,
                    );

                    if (check.kind === 'status') {
                        if (
                            check.operationStatus ===
                            EV_FLOW_OPERATION_STATUS.done
                        ) {
                            await dispatch(
                                markDelivered(candidate.operationId),
                            );
                            stats.delivered += 1;
                            options.onDelivered?.(candidate);
                        } else if (
                            check.operationStatus ===
                            EV_FLOW_OPERATION_STATUS.failed
                        ) {
                            const detail =
                                check.detail || 'бэкенд сообщил об ошибке flow';

                            await dispatch(
                                markFailed(candidate.operationId, detail),
                            );
                            stats.failed += 1;
                            options.onFailedTerminal?.(candidate, detail);
                        } else {
                            stats.inProgress += 1;
                        }
                        // queued/running: бэк жив и операция ещё в работе —
                        // не мешаем, следующий прогон сверится снова.
                        continue;
                    }
                    if (check.kind === 'unavailable') {
                        countSkip(stats, 'status-unavailable');
                        // ПОПЫТКА, которая ничего не сдвинула: сверка статуса
                        // не ответила, конверт остался лежать. Метрикой это
                        // видно как частота — «бэк недоступен, а отчёты
                        // копятся»; терминальным исходом такое не является:
                        // следующий прогон сверится снова.
                        countDeliveryAttempt({
                            outcome: 'status-unavailable',
                            target: PRIMARY_BACKEND_TARGET_ID,
                            domain,
                        });
                        continue; // исход неизвестен — конверт не трогаем
                    }
                    // not-found. Была accepted-попытка — статус истёк (живёт
                    // час) либо отстала реплика: повторный POST рискует
                    // выполнить flow второй раз, конверт оставляем с warn
                    // (доктрина «допуск только без accepted», план А4).
                    // Не было — POST не долетел, повтор безопасен.
                    if (hasAcceptedAttempt(candidate)) {
                        console.warn(
                            '[event-outbox] операция принята ранее, но статус истёк — конверт оставлен без повторной отправки',
                            candidate.operationId,
                        );
                        countSkip(stats, 'status-expired');
                        // ЗАСТРЯЛ НАВСЕГДА — и это терминальный исход, а не
                        // пропуск прогона: повторный POST запрещён доктриной
                        // (риск второго исполнения), статуса больше нет,
                        // сдвинуть конверт нечем и некому. До этой врезки
                        // такие отчёты не были видны ни одним счётчиком —
                        // они просто переставали двигаться. Отметка пишется
                        // в конверт, поэтому следующие прогоны, соседние
                        // вкладки и новые сессии его не пересчитают.
                        //
                        // Пишем СВЕЖИЙ конверт, а не снимок начала прогона:
                        // соседняя вкладка могла погасить его поллингом, пока
                        // мы шли по списку, и запись снимка воскресила бы
                        // погашенное. Лишнее чтение случается один раз за
                        // жизнь конверта — дальше отметка уже стоит.
                        if (!isReportOutcomeCounted(candidate)) {
                            const fresh = await readOutboxEnvelope(
                                domain,
                                candidate.operationId,
                            );

                            if (fresh && !isReportOutcomeCounted(fresh)) {
                                await writeOutboxEnvelope(
                                    markReportOutcome(fresh, 'stuck'),
                                );
                            }
                        }
                        continue;
                    }
                }
                const summary = await deliverOutboxEnvelope(
                    domain,
                    candidate.operationId,
                    { ...options.deps, targets },
                );

                if (summary.status === 'executed-direct') {
                    stats.direct += 1;
                    // Прямой путь исполнил конверт из дренажа: движок уже
                    // закрыл его (delivered | partial) — остаётся честно
                    // синхронизировать flowStatus текущей отправки (шов).
                    options.onExecutedDirect?.(candidate, summary);
                    continue;
                }
                if (summary.status === 'direct-incomplete') {
                    stats.incomplete += 1;
                    // Батч ушёл, обязательная часть не применилась: движок
                    // закрыл конверт видимым провалом — интерфейсу нельзя
                    // говорить «отчёт проведён».
                    options.onDirectIncomplete?.(candidate, summary);
                    continue;
                }
                if (summary.status !== 'accepted') {
                    // Почему конверт не поехал: отказ цели, исчерпанный
                    // бэкофф, лок соседней вкладки, отсутствие живой цели.
                    countSkip(
                        stats,
                        summary.status === 'skipped'
                            ? summary.reason
                            : summary.status,
                    );
                    continue;
                }
                if (summary.operationStatus === EV_FLOW_OPERATION_STATUS.done) {
                    await dispatch(markDelivered(candidate.operationId));
                    stats.delivered += 1;
                    options.onDelivered?.(candidate);
                } else if (
                    summary.operationStatus === EV_FLOW_OPERATION_STATUS.failed
                ) {
                    const detail =
                        summary.detail ||
                        'бэкенд сообщил об ошибке flow при повторной отправке';

                    await dispatch(markFailed(candidate.operationId, detail));
                    stats.failed += 1;
                    options.onFailedTerminal?.(candidate, detail);
                } else {
                    stats.accepted += 1;
                    options.onAccepted?.(candidate, summary);
                }
            }

            const tail = await runDeferredTailPass(
                tailPending,
                domain,
                now(),
                options,
            );

            const rest = await listOutboxEnvelopes(domain);
            const undelivered = rest.filter(isUndeliveredEnvelope).length;
            const partialCount = rest.filter(
                envelope => envelope.state === OUTBOX_ENVELOPE_STATE.partial,
            ).length;
            const incompleteCount = rest.filter(isIncompleteEnvelope).length;

            dispatch(
                outboxActions.setUndelivered({
                    domain,
                    count: undelivered,
                    partialCount,
                    incompleteCount,
                }),
            );

            if (drainAnnounced) {
                // Один осмысленный лог на прогон: что он сделал и что после
                // него осталось лежать в браузере. По конверту не логируем —
                // спам; причины пропусков сведены в состав.
                console.log(
                    `[event-outbox] дренаж ${domain} завершён: доставлено ${stats.delivered}, ` +
                        `принято ${stats.accepted}, в работе ${stats.inProgress}, ` +
                        `провалено ${stats.failed}, напрямую ${stats.direct}, ` +
                        `не целиком ${stats.incomplete}; хвост: доехал ${tail.done}, ` +
                        `сузился ${tail.narrowed}, не ушёл ${tail.failed}` +
                        (Object.keys(stats.skipped).length > 0
                            ? `; пропущено (${describeSkips(stats.skipped)})`
                            : '') +
                        `. Осталось недоставленных ${undelivered} ` +
                        `(из них ждут досылки ${partialCount}), ` +
                        `проведено не целиком ${incompleteCount}`,
                );
            }

            if (options.rearm !== false) {
                stopOutboxDrainTimer();
                // Таймер держат только конверты, с которыми следующий прогон
                // РЕАЛЬНО может что-то сделать: сейчас (pending, протухший
                // delivering) или позже — по сроку бэкоффа / по чужой аренде.
                // Терминальные состояния (skip reason `state`) крутили бы
                // 60с-цикл пустых прогонов до конца сессии. Бейдж их
                // по-прежнему считает недоставленными (семантика счётчика
                // не меняется), а разбудить дренаж есть кому и без таймера:
                // бут, 'online' и armOutboxDrainTimer. Исключение —
                // partial с неотправленным хвостом: его везёт пас А5,
                // значит таймер ему нужен.
                const drainable = rest.filter(
                    envelope =>
                        isUndeliveredEnvelope(envelope) &&
                        envelope.v === OUTBOX_ENVELOPE_VERSION &&
                        // Конверт с неотправленным хвостом (А5) дренажу
                        // тоже по силам — своим пасом, а не общим циклом.
                        (isTailPendingEnvelope(envelope) ||
                            getDeliverySkipReason(envelope, now(), tabId) !==
                                'state'),
                ).length;

                if (drainable > 0) {
                    scheduleDrainTimer(dispatch, options);
                }
            }
        } finally {
            if (drainAnnounced) {
                dispatch(outboxActions.setDraining(false));
            }
            drainInFlight = false;
        }
    };
