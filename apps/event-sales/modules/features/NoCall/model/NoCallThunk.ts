import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { eventReportActions } from '@/modules/entities/EventReport';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { eventTaskActions } from '@/modules/entities/EventTask';
import { setCurrentReportContact } from '@/modules/entities/EventContact/model/EventContactThunk';
import { CallResults, noCallActions } from './NoCallSlice';
import { ResultCountHelper } from '../lib/api/result-count-helper';

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
        dispatch(setCurrentReportContact(currentTask));

        if (status) {
            const noresultReasonName =
                state.eventReport.report[EV_REPORT_PROP.NORESULT_REASON].items[1]!.name;
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
 * Отправка недозвона: payload с isNoCall и неактивным планом →
 * POST /event-sales/flow; отметка задачи и закрытие меню (без перехода на Finish).
 *
 * Как и отчёт, отправка асинхронная: POST только принимает операцию. Меню
 * закрываем сразу — менеджеру незачем ждать, — а исход доезжает наблюдателем
 * и виден баннером в списке. Список при этом НЕ перезагружаем: задача уже
 * помечена локально, а полная перезагрузка мешала бы отмечать недозвоны подряд.
 */
export const sendNoCall =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const currentTaskId = Number(state.eventTask.current?.id || 0);

        const { buildFlowPayload } = await import(
            '@/modules/processes/event/lib/build-flow-payload'
        );
        const { FlowHelper } = await import(
            '@/modules/processes/event/lib/api/flow-helper'
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

        const operationId = createOperationId();
        const payload = buildFlowPayload(state, { isNoCall: true, operationId });

        dispatch(
            flowStatusActions.setSending({
                startedAt: Date.now(),
                result: '',
                operationId,
            }),
        );

        try {
            await new FlowHelper().sendFlow(payload);
        } catch (error) {
            console.error('sendNoCall error', error);
            dispatch(
                flowStatusActions.setError({
                    message: 'Недозвон не отправлен — попробуйте ещё раз.',
                }),
            );
            return;
        }

        if (currentTaskId) {
            dispatch(noCallActions.setSendedTaskId({ taskId: currentTaskId }));
        }
        dispatch(setCurrentReportContact(null));
        dispatch(getNoCallMenu(null, false));

        await dispatch(
            watchFlowOperation({
                operationId,
                domain: payload.domain,
                tasksStale: false,
            }),
        );
    };
