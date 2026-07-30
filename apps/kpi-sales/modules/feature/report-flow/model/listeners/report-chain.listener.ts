import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import { getCallingStatistics } from '../calling-statistics-flow-thunk';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import { getReportData, loadSavedFilter } from '../report-flow-thunks';

/** Тишина после последнего изменения фильтра перед перезапросом. */
const FILTER_DEBOUNCE_MS = 400;

/**
 * Цепочка загрузки отчёта:
 *   структура отделов готова → применяем сохранённый фильтр;
 *   фильтр применён → грузим отчёт и статистику звонков;
 *   смена даты/состава сотрудников → перезагрузка обоих (с дебаунсом).
 *
 * Последний пункт закрывает баг «выделил другой день — числа не меняются»:
 * changeDate только писал дату в стор, перезапрос существовал лишь на
 * маунт-цепочке (airtime жил своим useEffect, KPI/звонки — нет).
 * Дедуп повторов — по requestKey внутри thunks.
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

    listener.startListening({
        matcher: isAnyOf(
            reportActions.setChangedDate,
            reportActions.setChangedDateMode,
            departmentActions.setDepartmentCurrent,
        ),
        effect: async (_action, api) => {
            // Дебаунс: серия изменений (двойная граница периода, маунт-
            // цепочка сохранённого фильтра) даёт ОДИН перезапрос.
            api.cancelActiveListeners();
            await api.delay(FILTER_DEBOUNCE_MS);
            api.dispatch(getReportData());
            api.dispatch(getCallingStatistics());
        },
    });
};
