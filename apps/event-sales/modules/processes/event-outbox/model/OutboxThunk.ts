import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
// Прямой путь, а не барель shared/metrics: врезка должна быть видна в
// импортах файла и подменяться тестом одной строкой.
import { countSend } from '@/modules/shared/metrics/lib/business-metrics';

import {
    PRIMARY_BACKEND_TARGET_ID,
    getDeliveryTargets,
} from '../lib/delivery-targets';
import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
    applyAttempt,
    canTransition,
    isIncompleteEnvelope,
    isUndeliveredEnvelope,
    mergeRequeuedEnvelope,
    releaseEnvelopeLease,
    transitionEnvelope,
    type OutboxEnvelope,
} from '../lib/outbox-envelope';
import {
    deliverOutboxEnvelope,
    type OutboxDeliveryDeps,
    type OutboxDeliverySummary,
} from '../lib/outbox-delivery';
import { markReportOutcome } from '../lib/report-outcome';
import {
    findOutboxEnvelope,
    listOutboxEnvelopes,
    readOutboxEnvelope,
    writeOutboxEnvelope,
} from '../lib/outbox-store';
import { deliverEnvelopeDirect } from './DirectDeliveryThunk';
import { OUTBOX_DELIVERY_PHASE, outboxActions } from './OutboxSlice';

/**
 * Конвейер отправки через outbox: конверт на диск → доставка. Интеграция в
 * SendThunk/NoCallThunk заменит прямой flowHelper.sendFlow на
 * enqueueAndDeliver, а существующий поллинг статуса (FlowWatch) — позовёт
 * markDelivered/markFailed. Семантика «финиш уходит до ответа» сохраняется:
 * см. onEnqueued.
 */

let persistRequested = false;

/**
 * `navigator.storage.persist()` при первом enqueue: просим браузер не
 * выселять IndexedDB с конвертами. Ответ только в лог — отказ не страшен,
 * остаточный риск не выше сегодняшнего (payload жил только в памяти).
 */
const requestPersistOnFirstEnqueue = (): void => {
    if (persistRequested) {
        return;
    }
    persistRequested = true;

    try {
        const storage =
            typeof navigator === 'undefined' ? undefined : navigator.storage;

        if (!storage || typeof storage.persist !== 'function') {
            console.log('[event-outbox] storage.persist недоступен');
            return;
        }
        void storage.persist().then(
            granted =>
                console.log(
                    `[event-outbox] storage.persist: ${granted ? 'granted' : 'denied'}`,
                ),
            error => console.warn('[event-outbox] storage.persist упал', error),
        );
    } catch (error) {
        console.warn('[event-outbox] storage.persist упал', error);
    }
};

/** Сброс сессионного флага persist — для тестов. */
export const resetOutboxPersistRequestForTests = (): void => {
    persistRequested = false;
};

/** Пересчёт зеркала: счётчики недоставленных домена — из хранилища. */
export const refreshOutboxMirror =
    (domain: string) => async (dispatch: AppDispatch) => {
        const envelopes = await listOutboxEnvelopes(domain);

        dispatch(
            outboxActions.setUndelivered({
                domain,
                count: envelopes.filter(isUndeliveredEnvelope).length,
                // partial — тоже недоставленные, но ждут ДОСЫЛКИ хвоста
                // (А5), а не отправки: полоске нужна честная формулировка.
                partialCount: envelopes.filter(
                    envelope =>
                        envelope.state === OUTBOX_ENVELOPE_STATE.partial,
                ).length,
                // Проведённые не целиком: в недоставленные не входят (их
                // никто не дошлёт), но менеджеру о них знать обязательно.
                incompleteCount: envelopes.filter(isIncompleteEnvelope).length,
            }),
        );
    };

/**
 * Продовый реестр целей с подключённым прямым исполнителем (А4):
 * direct-bitrix зовёт deliverEnvelopeDirect через dispatch. Реестр строится
 * на конвейере — lib/delivery-targets остаётся чистой конфигурацией без
 * Redux, а тестовые deps.targets подменяют его целиком.
 */
export const getWiredDeliveryTargets = (
    dispatch: AppDispatch,
    placement?: string | null,
) =>
    getDeliveryTargets({
        deliverDirect: envelope => dispatch(deliverEnvelopeDirect(envelope)),
        // Канарейка А5.5: во вкладке карточки прямой путь идёт первым.
        placement,
    });

const phaseFromSummary = (
    summary: OutboxDeliverySummary,
): OUTBOX_DELIVERY_PHASE => {
    switch (summary.status) {
        case 'accepted':
            return OUTBOX_DELIVERY_PHASE.ACCEPTED;
        case 'executed-direct':
            return OUTBOX_DELIVERY_PHASE.EXECUTED_DIRECT;
        case 'rejected':
            return OUTBOX_DELIVERY_PHASE.REJECTED;
        case 'exhausted':
            return OUTBOX_DELIVERY_PHASE.EXHAUSTED;
        default:
            return OUTBOX_DELIVERY_PHASE.SKIPPED;
    }
};

/**
 * Судьба отправки одной строкой — для лога. Он единственный след того, что
 * стало с отчётом на глазах менеджера: принят сервером, проведён напрямую
 * или лёг в браузер до лучших времён (тогда его дальше ведёт дренаж своими
 * логами прогона).
 */
const describeDeliverySummary = (summary: OutboxDeliverySummary): string => {
    switch (summary.status) {
        case 'accepted':
            return `принята сервером (статус ${summary.operationStatus ?? 'неизвестен'})`;
        case 'executed-direct':
            return `проведена напрямую в Битриксе, хвост досылки: ${summary.deferred.length}`;
        case 'direct-incomplete':
            return `проведена НЕ ЦЕЛИКОМ: ${summary.failedCommands.join(', ')}`;
        case 'rejected':
            return `отвергнута: ${summary.detail ?? 'без деталей'}`;
        case 'exhausted':
            return 'сервер не ответил — отчёт лежит в браузере, дошлёт дренаж';
        default:
            return `не отправлена (${summary.reason})`;
    }
};

export interface EnqueueAndDeliverOptions {
    /**
     * Вызывается сразу после awaited-записи конверта, ДО доставки — сюда
     * интеграция вставит уход на финиш: порядок «конверт → финиш →
     * доставка» из плана, UX не меняется.
     */
    onEnqueued?: () => void;
    /** Инжекция для тестов (цели, время, паузы, лок). */
    deps?: OutboxDeliveryDeps;
}

/**
 * Итог конвейера: исход доставки плюс судьба записи конверта.
 * `persisted: false` — хранилище конверт не приняло (kind `none`, квота):
 * он жил только в памяти вкладки и умрёт вместе с ней, дренаж его не
 * увидит. Вызывающий обязан учесть это в стадии финиша: обещать «сохранено,
 * отправим автоматически» такому конверту нельзя — отчёт пропал бы молча.
 */
export type EnqueueDeliverySummary = OutboxDeliverySummary & {
    /** Конверт реально лёг в хранилище и переживёт вкладку. */
    persisted: boolean;
};

/**
 * Записать конверт и доставить его по реестру целей: primary, а после
 * исчерпания его сетевых попыток — прямой исполнитель direct-bitrix (А4).
 *
 * Запись awaited и происходит ДО первого HTTP: закрытая на середине вкладка
 * больше не теряет отчёт — конверт дождётся дренажа. Исход `accepted`
 * оставляет конверт `delivering`: подтверждение отдаст существующий поллинг
 * статуса (markDelivered/markFailed). Хранилища нет — конверт едет в памяти
 * (fallback), сама отправка работает как прежде, но итог несёт
 * `persisted: false` — на дренаж такому конверту рассчитывать нельзя.
 */
export const enqueueAndDeliver =
    (envelope: OutboxEnvelope, options: EnqueueAndDeliverOptions = {}) =>
    async (
        dispatch: AppDispatch,
        getState: AppGetState,
    ): Promise<EnqueueDeliverySummary> => {
        requestPersistOnFirstEnqueue();

        // ОТПРАВКА НАЧАЛАСЬ — единственная точка на оба вида: и отчёт
        // (sendEvent), и недозвон (sendNoCall) заходят сюда, вид лежит в
        // самом конверте. Считаем ДО записи в хранилище и до первого HTTP:
        // метрика про намерение менеджера, а не про успех — судьба этой же
        // отправки живёт отдельным счётчиком исходов. Повтор кнопкой
        // «Повторить» — тоже отправка и считается наравне: он и для
        // менеджера отдельное действие.
        countSend({ kind: envelope.kind, domain: envelope.domain });

        // Повтор с тем же operationId («Повторить») не должен стирать историю
        // попыток лежащего конверта: accepted в ней — единственная улика «бэк
        // уже принимал операцию», по которой дренаж сверяется со статусом
        // вместо слепого повторного POST (см. mergeRequeuedEnvelope).
        const stored = await readOutboxEnvelope(
            envelope.domain,
            envelope.operationId,
        );
        const merged = mergeRequeuedEnvelope(stored, envelope);

        const written = await writeOutboxEnvelope(merged);

        if (!written) {
            console.warn(
                '[event-outbox] хранилище не приняло конверт — отправка без страховки',
                merged.operationId,
            );
        }
        dispatch(
            outboxActions.setCurrentDelivery({
                operationId: merged.operationId,
                phase: OUTBOX_DELIVERY_PHASE.ENQUEUED,
            }),
        );
        await dispatch(refreshOutboxMirror(merged.domain));

        options.onEnqueued?.();

        dispatch(
            outboxActions.setCurrentDelivery({
                operationId: merged.operationId,
                phase: OUTBOX_DELIVERY_PHASE.DELIVERING,
            }),
        );

        const summary = await deliverOutboxEnvelope(
            merged.domain,
            merged.operationId,
            {
                ...options.deps,
                // Продовый реестр — с прямым исполнителем (А4); тестовые
                // deps.targets имеют приоритет и реестра не строят.
                targets:
                    options.deps?.targets ??
                    getWiredDeliveryTargets(
                        dispatch,
                        getState().app.bitrix?.placement?.placement,
                    ),
                fallbackEnvelope: merged,
            },
        );

        dispatch(
            outboxActions.setCurrentDelivery({
                operationId: merged.operationId,
                phase: phaseFromSummary(summary),
            }),
        );
        await dispatch(refreshOutboxMirror(merged.domain));
        // Один лог на отправку: дальше судьбу конверта ведёт дренаж, у него
        // свой лог прогона. Незаписанный конверт помечаем явно — на дренаж
        // ему рассчитывать нельзя.
        console.log(
            `[event-outbox] отправка ${merged.operationId}: ` +
                describeDeliverySummary(summary) +
                (written ? '' : ' (в браузере НЕ сохранён)'),
        );

        return { ...summary, persisted: written };
    };

/**
 * Погасить конверт: существующий поллинг статуса увидел `done`.
 * Зовёт интеграция из FlowWatch и дренаж (повторный POST вернул `done`).
 */
export const markDelivered =
    (operationId: string) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const envelope = await findOutboxEnvelope(
            operationId,
            getState().app.domain || undefined,
        );

        // Конверта нет — законно: хранилище могло быть сквозным (kind none).
        if (!envelope) {
            return;
        }
        if (envelope.state === OUTBOX_ENVELOPE_STATE.delivered) {
            return; // повторный done — уже погашен
        }
        // Конверт, чьё ядро исполнено НАПРЯМУЮ, гасится в delivered только
        // с пустым хвостом: delivered — терминал, и «done» по нему (сверка
        // статуса дренажа, будущая досылка А5, депо А5.7) утащил бы в
        // небытие весь deferred — KPI, движения сделок, элементы смартов.
        if (envelope.executedDirect && (envelope.deferred?.length ?? 0) > 0) {
            console.warn(
                '[event-outbox] done для конверта с непустой досылкой — конверт оставлен в partial',
                operationId,
            );
            return;
        }
        if (!canTransition(envelope.state, OUTBOX_ENVELOPE_STATE.delivered)) {
            console.warn(
                `[event-outbox] done для конверта в состоянии ${envelope.state} — пропущено`,
                operationId,
            );
            return;
        }

        // ОТЧЁТ РЕАЛЬНО ПРОВЕДЁН — терминальный исход, и считается он ровно
        // здесь. `accepted` считать успехом было нельзя: это «бэк взял
        // операцию», а провалиться она могла уже после. Однократность держит
        // отметка в самом конверте (см. markReportOutcome): гвард по
        // состоянию выше отсекает повтор в этой вкладке, отметка — повтор из
        // соседней вкладки, из дренажа и из следующей сессии.
        await writeOutboxEnvelope({
            ...markReportOutcome(
                releaseEnvelopeLease(
                    transitionEnvelope(
                        envelope,
                        OUTBOX_ENVELOPE_STATE.delivered,
                        Date.now(),
                    ),
                ),
                'delivered',
            ),
            nextAttemptAt: null,
        });
        dispatch(outboxActions.clearCurrentDelivery({ operationId }));
        await dispatch(refreshOutboxMirror(envelope.domain));
    };

/**
 * Бэкенд сообщил провал flow (поллинг увидел `failed`). Записывается как
 * `rejected`-попытка primary: авторетраев нет — повторяет человек кнопкой
 * «Повторить» (retrySendEvent с тем же operationId).
 */
export const markFailed =
    (operationId: string, detail: string) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const envelope = await findOutboxEnvelope(
            operationId,
            getState().app.domain || undefined,
        );

        if (!envelope) {
            return;
        }
        if (envelope.state === OUTBOX_ENVELOPE_STATE.failed) {
            return; // повторный failed — уже учтён
        }
        if (!canTransition(envelope.state, OUTBOX_ENVELOPE_STATE.failed)) {
            console.warn(
                `[event-outbox] failed для конверта в состоянии ${envelope.state} — пропущено`,
                operationId,
            );
            return;
        }

        // ОТВЕРГНУТ СЕРВЕРОМ — терминальный исход. Раньше сюда счётчик не
        // доходил вовсе: считались только СИНХРОННЫЕ отказы цели, а отказ,
        // о котором бэк сообщил статусом (это основной путь — операция
        // исполняется асинхронно), метрике был не виден. Счётчик отвергнутых
        // из-за этого врал в сторону «всё хорошо».
        await writeOutboxEnvelope(
            markReportOutcome(
                releaseEnvelopeLease(
                    applyAttempt(
                        envelope,
                        {
                            targetId: PRIMARY_BACKEND_TARGET_ID,
                            at: Date.now(),
                            outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                            detail,
                        },
                        null,
                    ),
                ),
                'rejected',
            ),
        );
        await dispatch(refreshOutboxMirror(envelope.domain));
    };
