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
