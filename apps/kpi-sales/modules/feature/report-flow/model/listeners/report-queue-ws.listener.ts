import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { WSClient } from '@workspace/ws';
import { appActions } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { getWSClient } from '@/modules/app/model/ws-client';
import { callingStatisticsActions } from '@/modules/entities/calling-statistics';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import type { ReportData } from '@/modules/entities/report/model/types/report/report-type';
import { applyReportData } from '../report-flow-thunks';
import { clearPoll, isCurrentKey } from '../report-queue.util';

/** WS-события queue-флоу отчёта (зеркало KPI_REPORT_WS_EVENTS бэка). */
export const REPORT_QUEUE_WS_EVENTS = {
    REPORT_DONE: 'kpi-report:done',
    REPORT_ERROR: 'kpi-report:error',
    CALLING_DONE: 'kpi-report:calling-statistic:done',
    CALLING_ERROR: 'kpi-report:calling-statistic:error',
} as const;

interface DonePayload<T> {
    requestKey: string;
    data: T;
}

interface ErrorPayload {
    requestKey: string;
    message?: string;
}

const waitForConnection = async (wsClient: WSClient) =>
    new Promise<void>(resolve => {
        if (wsClient.socket.connected) resolve();
        else wsClient.socket.once('connect', () => resolve());
    });

/** Повторный setAppData (реинициализация домена) не должен плодить хендлеры. */
let handlersWired = false;

/**
 * Готовые результаты queue-расчётов отчёта/звонков: done-событие несёт
 * данные — применяем сразу, без дополнительного POST. Матчинг по
 * requestKey отбрасывает события устаревших фильтров; поллинг остаётся
 * самодостаточным фолбэком (WS может не подняться).
 */
export const startReportQueueWsListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (_action, { dispatch }) => {
            if (handlersWired) return;
            const wsClient = getWSClient();
            await waitForConnection(wsClient);
            handlersWired = true;

            wsClient.on(
                REPORT_QUEUE_WS_EVENTS.REPORT_DONE,
                (payload: DonePayload<ReportData[]>) => {
                    if (!payload?.requestKey) return;
                    if (!isCurrentKey('report', payload.requestKey)) return;
                    clearPoll('report');
                    dispatch(applyReportData(payload.data ?? []));
                },
            );
            wsClient.on(
                REPORT_QUEUE_WS_EVENTS.REPORT_ERROR,
                (payload: ErrorPayload) => {
                    if (!payload?.requestKey) return;
                    if (!isCurrentKey('report', payload.requestKey)) return;
                    clearPoll('report');
                    dispatch(reportActions.setLoadingReportStatus(false));
                    console.error(
                        'kpi-report error:',
                        payload.message ?? 'расчёт упал',
                    );
                },
            );
            wsClient.on(
                REPORT_QUEUE_WS_EVENTS.CALLING_DONE,
                (payload: DonePayload<ReportCallingData[]>) => {
                    if (!payload?.requestKey) return;
                    if (!isCurrentKey('calling', payload.requestKey)) return;
                    clearPoll('calling');
                    dispatch(
                        callingStatisticsActions.setFetched(
                            payload.data ?? [],
                        ),
                    );
                    dispatch(callingStatisticsActions.setLoading(false));
                },
            );
            wsClient.on(
                REPORT_QUEUE_WS_EVENTS.CALLING_ERROR,
                (payload: ErrorPayload) => {
                    if (!payload?.requestKey) return;
                    if (!isCurrentKey('calling', payload.requestKey)) return;
                    clearPoll('calling');
                    dispatch(callingStatisticsActions.setLoading(false));
                    console.error(
                        'calling-statistic error:',
                        payload.message ?? 'расчёт упал',
                    );
                },
            );
        },
    });
};
