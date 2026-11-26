'use client';

import { useMemo } from 'react';
import { ReportCallingData } from '@/modules/entities/calling-statistics';
import { getCallingStatisticsTableData } from '@/modules/entities/calling-statistics';
import { getReportTableData } from '@/modules/entities/report';
import { ReportData } from '@/modules/entities/report';
import {
    RTable,
    RTableAnnotation,
    type TableRowsDecorator,
    type TableTotalsDecorator,
} from '@/modules/shared';
import { labelTableRows } from '@/modules/shared/lib/indicator-labels';
import { useIndicatorLabeler } from '@/modules/feature/portal-view';
import { getMergedReportsData } from '../lib/merge-reports.util';
import { selectMergedTableRows } from '../lib/merged-table-selection.util';
import { MergedReportTotalTable } from './MergedReportTotalTable';
import { useMergedReport } from '../hooks/merged-report.hook';
import { useAppSelector, selectIsPublic } from '@/modules/app';

interface MergedSectionTableProps {
    report: ReportData[];
    callingsReport: ReportCallingData[];
    /** Аннотации ячеек таблицы (% конверсий). */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
    /** Колонки планов слева от факта — после отбора «Колонок». */
    withPlanColumns?: TableRowsDecorator;
    /** Итог плана слева от итога факта. */
    withPlanTotals?: TableTotalsDecorator;
}

/**
 * Лёгкая merged-таблица для секции разбивки (отдел/группа): без своих
 * фильтров и графиков — только таблица и итоги. Выбор показателей и
 * сотрудников объединённого отчёта (mergedReport-слайс) применяется и здесь.
 */
export const MergedSectionTable = ({
    report,
    callingsReport,
    annotations,
    planAnnotations,
    withPlanColumns,
    withPlanTotals,
}: MergedSectionTableProps) => {
    const { selectedUsers, selectedActions } = useMergedReport();
    const isPublic = useAppSelector(selectIsPublic);
    const labelOf = useIndicatorLabeler();

    const merged = useMemo(() => {
        // Сотрудник из одного источника остаётся строкой с нулями по другому,
        // поэтому секция пуста, только когда пусты оба источника.
        if (!report.length && !callingsReport.length) return null;
        if (report.length && !report[0]?.kpi) return null;
        return getMergedReportsData(
            getReportTableData(report),
            getCallingStatisticsTableData(callingsReport),
        );
    }, [report, callingsReport]);

    const filteredData = useMemo(
        () =>
            selectMergedTableRows(merged?.data ?? [], {
                selectedUsers,
                selectedActions,
            }),
        [merged, selectedUsers, selectedActions],
    );
    // Для показа: свои названия в шапке (отбор выше — по исходным), затем
    // колонки планов (план уходит вместе со скрытым фактом)
    const displayRows = useMemo(() => {
        const labeled = labelTableRows(filteredData, labelOf);
        return withPlanColumns ? withPlanColumns(labeled) : labeled;
    }, [filteredData, labelOf, withPlanColumns]);

    if (!merged || !filteredData.length) {
        return (
            <div className="py-2 text-sm text-muted-foreground">
                Нет данных за период
            </div>
        );
    }

    const visibleActions =
        filteredData[0]?.actions.map(action => action.name) ?? [];

    return (
        <div className="space-y-3">
            <RTable
                code={merged.code}
                firstCellName={merged.firstCellName}
                data={displayRows}
                withLink={!isPublic}
                annotations={annotations}
                planAnnotations={planAnnotations}
            />
            <MergedReportTotalTable
                data={filteredData}
                selectedActions={visibleActions}
                labelOf={labelOf}
                withPlanTotals={withPlanTotals}
            />
        </div>
    );
};
