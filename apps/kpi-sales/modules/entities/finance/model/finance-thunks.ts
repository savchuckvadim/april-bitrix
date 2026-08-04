import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { getWSClient } from '@/modules/app/model/ws-client';
import type { SalesFinanceCacheResetRequestDtoScope } from '@workspace/nest-kpi-report-sales-api';
import { FinanceHelper } from '../lib/api/finance-helper';
import { shiftPeriod } from '../lib/period-shift.util';
import type { FinanceClosedReport, FinanceHotReport } from './index';
import { buildFinanceRequestKey, financeActions } from './finance-slice';

const financeHelper = new FinanceHelper();

/** Queued-ответ не пришёл по WS за это время — снимаем спиннер ошибкой. */
const QUEUED_TIMEOUT_MS = 90_000;

const safeSocketId = (): string | undefined => {
    try {
        return getWSClient().socket.id as string | undefined;
    } catch {
        return undefined;
    }
};

type FinanceSection = 'closed' | 'comparison' | 'hot' | 'userFinance';

const FAILED_ACTION = {
    closed: financeActions.closedFailed,
    comparison: financeActions.comparisonFailed,
    hot: financeActions.hotFailed,
    userFinance: financeActions.userFinanceFailed,
} as const;

/**
 * Страховка от «вечного спиннера»: если queued-результат не приехал по WS
 * и секция всё ещё грузит тот же запрос — переводим в ошибку.
 */
const scheduleQueuedTimeout = (
    dispatch: AppDispatch,
    getState: AppGetState,
    section: FinanceSection,
    requestKey: string,
): void => {
    setTimeout(() => {
        const sectionState = getState().finance[section];
        if (
            sectionState.status === 'loading' &&
            sectionState.requestKey === requestKey
        ) {
            dispatch(
                FAILED_ACTION[section](
                    'Расчёт занял слишком долго. Нажмите «Пересчитать».',
                ),
            );
        }
    }, QUEUED_TIMEOUT_MS);
};

const currentAssignedIds = (getState: AppGetState): number[] =>
    getState()
        .department.current.map(user => Number(user.ID))
        .filter(Boolean);

const errorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : 'Ошибка финансового отчёта';

/** Закрытые продажи за текущий период глобального фильтра. */
export const getClosedSales =
    (forceRefresh = false) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { from, to } = state.report.date;
        const assignedIds = currentAssignedIds(getState);
        // Пустой domain — публичная страница /share: данные сидятся снимком.
        if (!state.app.domain || !from || !to || !assignedIds.length) return;

        const requestKey = buildFinanceRequestKey(from, to, assignedIds);
        const { status, requestKey: loadedKey } = state.finance.closed;
        if (!forceRefresh && loadedKey === requestKey && status !== 'error') {
            return;
        }

        dispatch(financeActions.closedPending(requestKey));
        try {
            const response = await financeHelper.getClosedSales({
                domain: state.app.domain,
                socketId: safeSocketId(),
                forceRefresh,
                filters: { assignedIds, dateFrom: from, dateTo: to },
            });
            if (response.status === 'ready' && response.data) {
                dispatch(
                    financeActions.closedReady(
                        response.data as FinanceClosedReport,
                    ),
                );
            } else {
                // queued — результат придёт по WS (closedSalesArrived)
                scheduleQueuedTimeout(dispatch, getState, 'closed', requestKey);
            }
        } catch (error) {
            dispatch(financeActions.closedFailed(errorMessage(error)));
        }
    };

/** Закрытые продажи за период сравнения (ПП/ГкГ). */
export const getComparisonClosedSales =
    (forceRefresh = false) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const mode = state.finance.comparison.mode;
        if (mode === 'off') return;
        const { from, to } = state.report.date;
        const assignedIds = currentAssignedIds(getState);
        if (!state.app.domain || !from || !to || !assignedIds.length) return;

        const shifted = shiftPeriod(from, to, mode);
        const requestKey = buildFinanceRequestKey(
            shifted.from,
            shifted.to,
            assignedIds,
        );
        const { status, requestKey: loadedKey } = state.finance.comparison;
        if (!forceRefresh && loadedKey === requestKey && status !== 'error') {
            return;
        }

        dispatch(financeActions.comparisonPending(requestKey));
        try {
            const response = await financeHelper.getClosedSales({
                domain: state.app.domain,
                socketId: safeSocketId(),
                forceRefresh,
                filters: {
                    assignedIds,
                    dateFrom: shifted.from,
                    dateTo: shifted.to,
                },
            });
            if (response.status === 'ready' && response.data) {
                dispatch(
                    financeActions.comparisonReady(
                        response.data as FinanceClosedReport,
                    ),
                );
            } else {
                scheduleQueuedTimeout(
                    dispatch,
                    getState,
                    'comparison',
                    requestKey,
                );
            }
        } catch (error) {
            dispatch(financeActions.comparisonFailed(errorMessage(error)));
        }
    };

/** Горячие клиенты (живой снимок, порог из настроек). */
export const getHotClients =
    (forceRefresh = false) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const assignedIds = currentAssignedIds(getState);
        if (!state.app.domain || !assignedIds.length) return;

        const threshold = state.finance.hot.threshold;
        const requestKey = `${threshold}|${[...assignedIds]
            .sort((a, b) => a - b)
            .join('_')}`;
        const { status, requestKey: loadedKey } = state.finance.hot;
        if (!forceRefresh && loadedKey === requestKey && status !== 'error') {
            return;
        }

        dispatch(financeActions.hotPending(requestKey));
        try {
            const response = await financeHelper.getHotClients({
                domain: state.app.domain,
                socketId: safeSocketId(),
                forceRefresh,
                threshold,
                assignedIds,
            });
            if (response.status === 'ready' && response.data) {
                dispatch(
                    financeActions.hotReady(
                        response.data as FinanceHotReport,
                    ),
                );
            } else {
                scheduleQueuedTimeout(dispatch, getState, 'hot', requestKey);
            }
        } catch (error) {
            dispatch(financeActions.hotFailed(errorMessage(error)));
        }
    };

/** Финансы одного менеджера (user report) + сравнение при mode≠off. */
export const getUserClosedSales =
    (userId: number) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { from, to } = state.report.date;
        if (!state.app.domain || !from || !to || !userId) return;

        const requestKey = buildFinanceRequestKey(from, to, [userId]);
        const { status, requestKey: loadedKey } = state.finance.userFinance;
        if (loadedKey !== requestKey || status === 'error') {
            dispatch(
                financeActions.userFinancePending({ requestKey, userId }),
            );
            try {
                const response = await financeHelper.getClosedSales({
                    domain: state.app.domain,
                    socketId: safeSocketId(),
                    filters: {
                        assignedIds: [userId],
                        dateFrom: from,
                        dateTo: to,
                    },
                });
                if (response.status === 'ready' && response.data) {
                    dispatch(
                        financeActions.userFinanceReady(
                            response.data as FinanceClosedReport,
                        ),
                    );
                } else {
                    scheduleQueuedTimeout(
                        dispatch,
                        getState,
                        'userFinance',
                        requestKey,
                    );
                }
            } catch (error) {
                dispatch(financeActions.userFinanceFailed(errorMessage(error)));
            }
        }

        const mode = getState().finance.comparison.mode;
        if (mode === 'off') return;
        // Даты могли смениться за время await — перечитываем.
        const currentDates = getState().report.date;
        if (currentDates.from !== from || currentDates.to !== to) return;
        const shifted = shiftPeriod(from, to, mode);
        const comparisonKey = buildFinanceRequestKey(
            shifted.from,
            shifted.to,
            [userId],
        );
        if (getState().finance.userFinance.comparisonKey === comparisonKey) {
            return;
        }
        dispatch(financeActions.userFinanceComparisonPending(comparisonKey));
        try {
            const response = await financeHelper.getClosedSales({
                domain: state.app.domain,
                socketId: safeSocketId(),
                filters: {
                    assignedIds: [userId],
                    dateFrom: shifted.from,
                    dateTo: shifted.to,
                },
            });
            if (response.status === 'ready' && response.data) {
                dispatch(
                    financeActions.userFinanceComparisonReady(
                        response.data as FinanceClosedReport,
                    ),
                );
            }
        } catch {
            // сравнение не критично
        }
    };

/** «Пересчитать»: forceRefresh обоих отчётов вкладки Финансы. */
export const refreshFinance =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        await Promise.all([
            dispatch(getClosedSales(true)),
            dispatch(getHotClients(true)),
            getState().finance.comparison.mode !== 'off'
                ? dispatch(getComparisonClosedSales(true))
                : Promise.resolve(),
        ]);
    };

/** Сброс серверного кэша финансовой аналитики по домену. */
export const resetFinanceCache =
    (scope?: SalesFinanceCacheResetRequestDtoScope) =>
    async (_dispatch: AppDispatch, getState: AppGetState) => {
        await financeHelper.resetCache(getState().app.domain, scope);
    };
