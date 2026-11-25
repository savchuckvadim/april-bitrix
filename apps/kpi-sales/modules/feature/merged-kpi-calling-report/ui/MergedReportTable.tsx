'use client'
import React, { useMemo } from 'react';
import { ReportCallingData } from "@/modules/entities/calling-statistics";
import { getCallingStatisticsTableData } from "@/modules/entities/calling-statistics/lib/ui-util";
import { getReportTableData } from "@/modules/entities/report/lib/ui-util";
import { ReportData } from "@/modules/entities/report/model/types/report/report-type";
import { ChartsGate, RTable, RTableAnnotation } from "@/modules/shared";
import { getMergedReportsData } from "../lib/merge-reports.util";
import {
    getMergedColumnNames,
    selectMergedTableRows,
} from "../lib/merged-table-selection.util";
import { MergedColumnsSelect } from "./MergedColumnsSelect";
import { MergedReportChart } from "./MergedReportChart";
import { MergedReportTotalTable } from "./MergedReportTotalTable";
import { MergedReportTotalChart } from "./MergedReportTotalChart";
import { useMergedReport } from '../hooks/merged-report.hook';
import { useAppSelector, selectIsPublic } from '@/modules/app';


interface MergedReportTableProps {
    report: ReportData[];
    callingsReport: ReportCallingData[];
    /** Аннотации ячеек таблицы (% конверсий). */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
}


/**
 * Объединённая таблица с графиками. Сотрудников задаёт главный фильтр
 * отчёта (в таблице все, кто в нём); колонки настраиваются списком
 * «Колонки» над таблицей. На публичной странице выбор сотрудников
 * приходит из снимка ссылки, а колонки зритель меняет у себя.
 */
export const MergedReportTable: React.FC<MergedReportTableProps> = ({ report, callingsReport, annotations, planAnnotations }) => {
    const { selectedUsers, selectedActions, setSelectedActions } = useMergedReport();
    const isPublic = useAppSelector(selectIsPublic);
    // Вычисляем данные (всегда, даже если нет данных)
    const tableKpiData = useMemo(() => {
        if (!report || (report.length && !report[0]?.kpi)) return null;
        return getReportTableData(report);
    }, [report]);

    const tableCallingsData = useMemo(() => {
        if (!callingsReport) return null;
        return getCallingStatisticsTableData(callingsReport);
    }, [callingsReport]);

    // Сотрудник из одного источника остаётся строкой с нулями по другому,
    // поэтому «нет данных» — только когда пусты оба источника.
    const mergedReportsData = useMemo(() => {
        if (!tableKpiData || !tableCallingsData) return null;
        if (!tableKpiData.data.length && !tableCallingsData.data.length) return null;
        return getMergedReportsData(tableKpiData, tableCallingsData);
    }, [tableKpiData, tableCallingsData]);

    const columns = useMemo(
        () => getMergedColumnNames(mergedReportsData?.data ?? []),
        [mergedReportsData],
    );

    // Пустой выбор сотрудников и показателей — без ограничения.
    const filteredData = useMemo(
        () =>
            selectMergedTableRows(mergedReportsData?.data ?? [], {
                selectedUsers,
                selectedActions,
            }),
        [mergedReportsData, selectedUsers, selectedActions],
    );

    // Ранний return ПОСЛЕ всех хуков
    if (!mergedReportsData) {
        return <div>Нет данных для отображения</div>;
    }

    return (
        <div className="space-y-4">
            <MergedColumnsSelect
                columns={columns}
                selectedActions={selectedActions}
                onChange={setSelectedActions}
            />

            {tableKpiData && (
                <RTable
                    code={tableKpiData.code}
                    firstCellName={tableKpiData.firstCellName}
                    data={filteredData}
                    withLink={!isPublic}
                    annotations={annotations}
                    planAnnotations={planAnnotations}
                />
            )}
            <ChartsGate>
                <MergedReportChart
                    data={filteredData}
                    selectedActions={selectedActions}
                />
            </ChartsGate>

            <MergedReportTotalTable
                data={filteredData}
                selectedActions={selectedActions}
            />

            <ChartsGate>
                <MergedReportTotalChart
                    data={filteredData}
                    selectedActions={selectedActions}
                />
            </ChartsGate>
        </div>
    );
};
