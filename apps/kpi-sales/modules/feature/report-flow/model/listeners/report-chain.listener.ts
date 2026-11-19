import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState, ThunkExtraArgument } from '@/modules/app/model/store';
import { appActions } from '@/modules/app/model/AppSlice';
import { isReportChainAllowed } from '@/modules/app/lib/layout/app-layout-kind';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import { getCallingStatistics } from '../calling-statistics-flow-thunk';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import { getReportData, loadSavedFilter } from '../report-flow-thunks';

/**
 * Цепочка загрузки отчёта:
 *   структура отделов готова → применяем сохранённый фильтр;
 *   фильтр применён (кнопка «Применить»/маунт) → отчёт + статистика звонков.
 *
 * НАМЕРЕННО без авто-перезапроса на смену даты/состава: пользователь
 * меняет несколько параметров пачкой и запускает запрос ЯВНО кнопкой —
 * иначе полуизменённый фильтр (новый from при старом to) улетал бы в
 * очередь мусорным запросом. Возможность перезапроса при уже идущем
 * расчёте гарантируют requestKey-дедуп и отсев устаревших в thunks.
 *
 * Только на страницах отчёта (isReportChainAllowed по app.layoutKind): на
 * «Разборах звонков» (/calls) шаги цепочки не запускаются, а помечаются
 * отложенными (report.chainDeferred) — тяжёлый расчёт отчёта там не нужен.
 * Переход в отчёт (layoutKind → report) доводит отложенную цепочку с
 * сохранённого фильтра. Отчёт, посчитанный до перехода на /calls, ничем не
 * перезапускается: отметка ставится только на шагах, пришедших там.
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
        effect: async (_action, { dispatch, getState }) => {
            if (!isReportChainAllowed(getState().app.layoutKind)) {
                dispatch(reportActions.setChainDeferred(true));
                return;
            }
            dispatch(loadSavedFilter());
        },
    });

    listener.startListening({
        matcher: isAnyOf(reportActions.setSavedFilter),
        effect: async (_action, { dispatch, getState }) => {
            if (!isReportChainAllowed(getState().app.layoutKind)) {
                dispatch(reportActions.setChainDeferred(true));
                return;
            }
            dispatch(getReportData());
            dispatch(getCallingStatistics());
        },
    });

    listener.startListening({
        actionCreator: appActions.setLayoutKind,
        effect: async (action, { dispatch, getState }) => {
            if (
                !getState().report.chainDeferred ||
                !isReportChainAllowed(action.payload)
            ) {
                return;
            }
            dispatch(reportActions.setChainDeferred(false));
            dispatch(loadSavedFilter());
        },
    });
};
