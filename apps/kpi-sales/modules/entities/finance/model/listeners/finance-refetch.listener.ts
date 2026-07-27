import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import { financeActions } from '../finance-slice';
import {
    getClosedSales,
    getComparisonClosedSales,
    getHotClients,
} from '../finance-thunks';

/**
 * Освежение финансовых данных при изменении глобальных фильтров — но только
 * после того как пользователь уже открывал вкладку (closed.status ≠ idle).
 * Это разводит связку с feature/report-widget-type: сам факт «финансы
 * загружались» и есть признак активности, знать текущий тип отчёта не нужно.
 * Первую загрузку/активацию вкладки делает mount-эффект FinanceReport.
 */
export const startFinanceRefetchListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(reportActions.setSavedFilter),
        effect: async (_action, { dispatch, getState }) => {
            if (getState().finance.closed.status === 'idle') return;
            dispatch(getClosedSales());
            dispatch(getHotClients());
            if (getState().finance.comparison.mode !== 'off') {
                dispatch(getComparisonClosedSales());
            }
        },
    });

    listener.startListening({
        matcher: isAnyOf(financeActions.setComparisonMode),
        effect: async (_action, { dispatch, getState }) => {
            const state = getState();
            if (
                state.finance.comparison.mode !== 'off' &&
                state.finance.closed.status !== 'idle'
            ) {
                dispatch(getComparisonClosedSales());
            }
        },
    });

    listener.startListening({
        matcher: isAnyOf(financeActions.setHotThreshold),
        effect: async (_action, { dispatch, getState }) => {
            if (getState().finance.hot.status !== 'idle') {
                dispatch(getHotClients());
            }
        },
    });
};
