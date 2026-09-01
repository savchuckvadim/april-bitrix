import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { eventReportActions } from '@/modules/entities/EventReport';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { eventTaskActions } from '@/modules/entities/EventTask';
import { setCurrentReportContact } from '@/modules/entities/EventContact/model/EventContactThunk';
import { eventContactActions } from '@/modules/entities/EventContact/model/EventContactSlice';
import { CallResults, noCallActions } from './NoCallSlice';
// type-only: стирается компилятором, ленивость конвейера отправки не ломает.
import type { EnqueueDeliverySummary } from '@/modules/processes/event-outbox/model/OutboxThunk';
import { ResultCountHelper } from '../lib/api/result-count-helper';
import { BACKEND_SUPPORT_READY } from '@/modules/app/consts/backend-support.const';

const resultCountHelper = new ResultCountHelper();

/** Счётчики результатов звонков (для ResultStatistics и меню недозвона). */
export const fetchResults =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.noCall.isLoading || getIsLeadContext(state)) return;

        const companyId = Number(state.app.bitrix.company?.ID || 0);
        const userId = Number(state.app.bitrix.user?.ID || 0);
        const domain = state.app.domain;
        if (!companyId || !domain) return;

        // /result/count на бэке — заглушка (null). Терминальное состояние
        // ставим без сети, поведение прежнее (см. backend-support.const).
        if (!BACKEND_SUPPORT_READY.resultCount) {
            dispatch(noCallActions.setFetched({ results: null }));
            return;
        }

        dispatch(noCallActions.setLoadingStatus({ status: true }));
        try {
            const result = (await resultCountHelper.getResultCount({
                domain,
                companyId,
                userId,
            })) as CallResults | null;
            dispatch(noCallActions.setFetched({ results: result }));
        } catch (error) {
            console.error('fetchResults error', error);
            dispatch(noCallActions.setFetched({ results: null }));
        } finally {
            dispatch(noCallActions.setLoadingStatus({ status: false }));
        }
    };

/**
 * Открытие/закрытие меню недозвона: чистит отчёт, ставит текущую задачу
 * и подставляет причину недозвона в комментарий.
 */
export const getNoCallMenu =
    (taskId: number | null, status: boolean) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const currentTask =
            state.eventTask.tasks?.find(task => task.id === taskId) ?? null;

        dispatch(eventReportActions.clean({ isTmc: false }));
        dispatch(eventTaskActions.setCurrentTask({ task: currentTask }));
        // Другая карточка — ручной выбор контакта прошлого дела не переносим.
        dispatch(eventContactActions.clearManualCurrent());
        dispatch(setCurrentReportContact(currentTask));

        if (status) {
            const noresultReasonName =
                state.eventReport.report[EV_REPORT_PROP.NORESULT_REASON]
                    .items[1]!.name;
            dispatch(
                eventReportActions.setReportProp({
                    propName: EV_REPORT_PROP.COMMENT,
                    value: noresultReasonName,
                }),
            );
        }

        dispatch(noCallActions.setActiveStatus({ status }));
    };

/**
 * Отправка недозвона: payload с isNoCall и неактивным планом → тот же
 * конвейер outbox, что у отчёта (kind `nocall`), без перехода на Finish.
 *
 * Порядок как у sendEvent: конверт пишется awaited ДО первого HTTP, затем
 * `setSending` (баннер списка), затем доставка. Меню закрываем, не дожидаясь
 * исхода — менеджеру незачем ждать; исход доезжает наблюдателем и виден
 * баннером. Сеть легла — конверт сохранён и доедет дренажем, задачу так же
 * помечаем локально; конверт в хранилище НЕ лёг (persisted: false) — честная
 * ошибка без пометки. Список НЕ перезагружаем: полная перезагрузка мешала бы
 * отмечать недозвоны подряд.
 */
export const sendNoCall =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const currentTaskId = Number(state.eventTask.current?.id || 0);

        const { buildFlowPayload } = await import(
            '@/modules/processes/event/lib/build-flow-payload'
        );
        const { createOperationId } = await import(
            '@/modules/processes/event/lib/operation-id'
        );
        const { flowStatusActions } = await import(
            '@/modules/processes/event/model/FlowStatusSlice'
        );
        const { watchFlowOperation } = await import(
            '@/modules/processes/event/model/FlowWatchThunk'
        );
        const {
            createOutboxEnvelope,
            OUTBOX_ENVELOPE_KIND,
            OUTBOX_ENVELOPE_STATE,
        } = await import(
            '@/modules/processes/event-outbox/lib/outbox-envelope'
        );
        const { DIRECT_BITRIX_TARGET_ID, PRIMARY_BACKEND_TARGET_ID } =
            await import(
                '@/modules/processes/event-outbox/lib/delivery-targets'
            );
        const { enqueueAndDeliver } = await import(
            '@/modules/processes/event-outbox/model/OutboxThunk'
        );

        const operationId = createOperationId();
        const { getSocketIdSafe } = await import(
            '@/modules/app/lib/ws/ws-client.util'
        );
        const payload = buildFlowPayload(state, {
            isNoCall: true,
            operationId,
            socketId: getSocketIdSafe(),
        });

        const envelope = createOutboxEnvelope({
            operationId,
            domain: payload.domain,
            userId: Number(state.app.bitrix.user?.ID || 0),
            kind: OUTBOX_ENVELOPE_KIND.nocall,
            payload,
        });

        let summary: EnqueueDeliverySummary;
        try {
            summary = await dispatch(
                enqueueAndDeliver(envelope, {
                    // «Финиш» недозвона — баннер отправки: включается между
                    // awaited-записью конверта и первым HTTP, как у отчёта.
                    onEnqueued: () => {
                        dispatch(
                            flowStatusActions.setSending({
                                startedAt: Date.now(),
                                result: '',
                                operationId,
                            }),
                        );
                    },
                }),
            );
        } catch (error) {
            console.error('sendNoCall error', error);
            dispatch(
                flowStatusActions.setError({
                    message: 'Недозвон не отправлен — попробуйте ещё раз.',
                }),
            );
            return;
        }

        if (summary.status === 'rejected') {
            // Бэк payload получил и отверг — повторять без правок бессмысленно,
            // меню оставляем открытым, задачу отправленной не помечаем.
            console.error('sendNoCall rejected', summary.detail);
            dispatch(
                flowStatusActions.setError({
                    message: 'Недозвон не отправлен — попробуйте ещё раз.',
                }),
            );
            return;
        }

        if (summary.status !== 'accepted' && !summary.persisted) {
            // Сеть исчерпана, а хранилище конверт не приняло (kind `none`,
            // квота): недозвон жил только в памяти вкладки — пометить задачу
            // «отправленной» значило бы молча его потерять. Честная ошибка,
            // меню остаётся открытым для повтора.
            console.error('sendNoCall: конверт не записан, сеть исчерпана');
            dispatch(
                flowStatusActions.setError({
                    message: 'Недозвон не отправлен — попробуйте ещё раз.',
                }),
            );
            return;
        }

        // Принят или сохранён конвертом (дошлёт дренаж) — для менеджера
        // недозвон отмечен: задача помечается, меню закрывается.
        if (currentTaskId) {
            dispatch(noCallActions.setSendedTaskId({ taskId: currentTaskId }));
        }
        dispatch(setCurrentReportContact(null));
        dispatch(getNoCallMenu(null, false));

        if (summary.status === 'direct-incomplete') {
            // Прямое исполнение прошло НЕ ЦЕЛИКОМ (А4): батч ушёл, часть
            // обязательных команд не применилась, доисполнить нечем. Стадия
            // честная — DONE+INCOMPLETE, без «недозвон проведён».
            console.error(
                'sendNoCall: недозвон проведён не целиком',
                summary.failedCommands.join(', '),
            );
            dispatch(
                flowStatusActions.setDeliveryTarget({
                    target: DIRECT_BITRIX_TARGET_ID,
                }),
            );
            dispatch(flowStatusActions.setDone({ tasksStale: false }));
            // Порядок важен: setDone сбрасывает outboxState в NONE.
            dispatch(flowStatusActions.setOutboxIncomplete());
            return;
        }

        if (summary.status === 'executed-direct') {
            // Прямое исполнение (А4): бэк молчал, недозвон проведён прямо в
            // Битриксе. Поллинга нет (операции на бэке не было); список не
            // трогаем — как и в обычном пути недозвона. Хвост deferred (если
            // есть) дошлёт эндпоинт А5 — баннер покажет DONE+PARTIAL.
            dispatch(
                flowStatusActions.setDeliveryTarget({
                    target: DIRECT_BITRIX_TARGET_ID,
                }),
            );
            dispatch(flowStatusActions.setDone({ tasksStale: false }));
            if (summary.envelopeState === OUTBOX_ENVELOPE_STATE.partial) {
                // Порядок важен: setDone сбрасывает outboxState в NONE.
                dispatch(flowStatusActions.setOutboxPartial());
            }
            return;
        }

        if (summary.status !== 'accepted') {
            dispatch(flowStatusActions.setOutboxQueued());
            return;
        }

        dispatch(
            flowStatusActions.setDeliveryTarget({
                target: PRIMARY_BACKEND_TARGET_ID,
            }),
        );

        await dispatch(
            watchFlowOperation({
                operationId,
                domain: payload.domain,
                tasksStale: false,
            }),
        );
    };
