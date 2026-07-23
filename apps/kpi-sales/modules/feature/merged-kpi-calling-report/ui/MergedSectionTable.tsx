'use client';

import { useMemo } from 'react';
import { ReportCallingData } from '@/modules/entities/calling-statistics';
import { getCallingStatisticsTableData } from '@/modules/entities/calling-statistics';
import { getReportTableData } from '@/modules/entities/report';
import { ReportData } from '@/modules/entities/report';
import { RTable } from '@/modules/shared';
import { getMergedReportsData } from '../lib/merge-reports.util';
import { MergedReportTotalTable } from './MergedReportTotalTable';
import { useMergedReport } from '../hooks/merged-report.hook';

interface MergedSectionTableProps {
    report: ReportData[];
    callingsReport: ReportCallingData[];
}

/**
 * Лёгкая merged-таблица для секции разбивки (отдел/группа): без своих
 * фильтров и графиков — только таблица и итоги. Локальный фильтр
 * объединённого отчёта (mergedReport-слайс) применяется и здесь.
 */
export const MergedSectionTable = ({
    report,
    callingsReport,
}: MergedSectionTableProps) => {
    const { selectedUsers, selectedActions } = useMergedReport();

    const merged = useMemo(() => {
        if (!report.length || !report[0]?.kpi || !callingsReport.length) {
            return null;
        }
        return getMergedReportsData(
            getReportTableData(report),
            getCallingStatisticsTableData(callingsReport),
        );
    }, [report, callingsReport]);

    const filteredData = useMemo(() => {
        if (!merged) return [];
        return merged.data
            .filter(
                user =>
                    !selectedUsers.length ||
                    (user.id !== undefined &&
                        selectedUsers.includes(Number(user.id))),
            )
            .map(user => ({
                ...user,
                actions: user.actions.filter(
                    action =>
                        !selectedActions.length ||
                        selectedActions.includes(action.name),
                ),
            }));
    }, [merged, selectedUsers, selectedActions]);

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
                data={filteredData}
                withLink={true}
            />
            <MergedReportTotalTable
                data={filteredData}
                selectedActions={visibleActions}
            />
        </div>
    );
};
