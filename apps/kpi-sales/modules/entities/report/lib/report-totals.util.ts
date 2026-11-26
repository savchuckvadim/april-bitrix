import {
    eventLabelKey,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import type {
    Filter,
    FilterInnerCode,
    ReportData,
} from '../model/types/report/report-type';

/** Колонка итога отчёта по событиям: показатель и сумма по всем сотрудникам. */
export interface ReportTotalColumn {
    code: FilterInnerCode;
    /** Выводимое название (своё название портала или исходное). */
    name: string;
    value: number;
    /** Показатель события — для цвета графика. */
    action: Filter;
}

/**
 * Итог по каждому показателю первой строки отчёта: сумма значений всех
 * сотрудников (сопоставление по innerCode). Название — для показа.
 */
export const getReportTotalColumns = (
    report: readonly ReportData[],
    labelOf: IndicatorLabeler,
): ReportTotalColumn[] => {
    const first = report[0];
    if (!first?.kpi) return [];
    return first.kpi.map(kpi => {
        const code = kpi.action.innerCode;
        return {
            code,
            name: labelOf(eventLabelKey(code), kpi.action.name || 'Unknown'),
            value: report.reduce(
                (sum, row) =>
                    sum +
                    (row.kpi.find(item => item.action.innerCode === code)?.count || 0),
                0,
            ),
            action: kpi.action,
        };
    });
};
