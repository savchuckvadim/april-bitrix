import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { isReportChainAllowed } from '@/modules/app/lib/layout/app-layout-kind';
import { getCallingStatistics } from './calling-statistics-flow-thunk';
import { activeReportDataNeeds } from './report-data-demand';
import { getReportData } from './report-flow-thunks';
import {
    isSavedFilterApplied,
    needsRequest,
    resolveReportFlowRequestKey,
} from './report-queue.util';

/**
 * Загрузка «по необходимости»: по текущей вкладке и действующему фильтру
 * запрашивает только те источники (события, звонки), которые вкладке нужны,
 * ещё не загружены для текущего ключа и не запрашиваются прямо сейчас.
 * Вкладке без нужд («Дайджест», «Финансы», «AI аналитика») не запрашивает
 * ничего — если источник не заявлен потребителем вне вкладки (страница
 * сотрудника, см. report-data-demand.ts).
 *
 * Не делает ничего, пока сохранённый фильтр не применён (фильтр ещё
 * стартовый — запрос ушёл бы мусорным) и вне страниц отчёта («Разборы
 * звонков»: тяжёлый расчёт отчёта там не нужен).
 *
 * Зовётся: цепочкой первой загрузки, сменой вкладки и страховкой при
 * маунте шапки отчёта. Кнопка «Применить» её не использует: повторное
 * «Применить» на вкладке отчёта запрашивает данные всегда.
 */
export const ensureReportData =
    () => (dispatch: AppDispatch, getState: () => RootState) => {
        if (!isSavedFilterApplied()) return;

        const { app, department, report, callingStatistics, reportType } =
            getState();
        if (!isReportChainAllowed(app.layoutKind)) return;

        const needs = activeReportDataNeeds(reportType.current);
        if (!needs.events && !needs.callings) return;

        const key = resolveReportFlowRequestKey(
            report.date,
            department.current,
            department.items,
        );
        if (!key) return;

        if (needs.events && needsRequest('report', key, report.isLoading)) {
            void dispatch(getReportData());
        }
        if (
            needs.callings &&
            needsRequest('calling', key, callingStatistics.isLoading)
        ) {
            void dispatch(getCallingStatistics());
        }
    };
