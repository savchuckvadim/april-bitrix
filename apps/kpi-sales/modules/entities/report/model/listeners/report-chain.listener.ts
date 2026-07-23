import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import { getCallingStatistics } from '@/modules/entities/calling-statistics';
import { reportActions } from '../report-slice';
import { getReportData, loadSavedFilter } from '../report-thunks';

/**
 * Цепочка загрузки отчёта:
 *   структура отделов готова → применяем сохранённый фильтр;
 *   фильтр применён → грузим отчёт и статистику звонков.
 */
export const startReportChainListeners = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(departmentActions.setStructure),
        effect: async (_action, { dispatch }) => {
            dispatch(loadSavedFilter());
        },
    });

    listener.startListening({
        matcher: isAnyOf(reportActions.setSavedFilter),
        effect: async (_action, { dispatch }) => {
            dispatch(getReportData());
            dispatch(getCallingStatistics());
        },
    });
};
