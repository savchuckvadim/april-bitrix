import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { getCallingStatistics } from './calling-statistics-flow-thunk';
import { activeReportDataNeeds } from './report-data-demand';
import { getReportData } from './report-flow-thunks';

/**
 * Кнопка «Пересчитать»: запрашивает заново, минуя сохранённый на сервере
 * расчёт (forceRefresh), те источники, что нужны сейчас — нужды текущей
 * вкладки плюс заявки потребителей вне вкладки (activeReportDataNeeds, как
 * у «Применить»). Вкладке без нужд не запрашивает ничего. Пока идёт расчёт,
 * страница показывает обычную загрузку: запросы сами её включают.
 *
 * Фильтр не меняется — запрашивается тот же период и те же сотрудники.
 */
export const recalculateReportData =
    () => (dispatch: AppDispatch, getState: () => RootState) => {
        const needs = activeReportDataNeeds(getState().reportType.current);
        if (needs.events) void dispatch(getReportData({ forceRefresh: true }));
        if (needs.callings) {
            void dispatch(getCallingStatistics({ forceRefresh: true }));
        }
    };
