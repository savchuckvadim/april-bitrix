'use client';

import React, { useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { RefreshCw } from 'lucide-react';
import { ReportBlockWrapper } from '@/modules/entities/report';
import { exportTableToCSV } from '@/modules/entities/report';
import { Preloader } from '@/modules/shared';
import { ReportGroupTabs, StructureSection } from '@/modules/feature/report-tabs';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    COMPARISON_MODE_LABELS,
    filterClosedReportByTypes,
    getClosedSales,
    getComparisonClosedSales,
    getHotClients,
    recomputeTotals,
    refreshFinance,
    sliceReportByUserIds,
    type FinanceClosedReport,
} from '@/modules/entities/finance';
import { FinanceSalesSummary } from '@/modules/feature/finance-summary';
import { FinanceMonthlyLineChart } from './components/FinanceMonthlyLineChart';
import { FinanceStructureDonut } from './components/FinanceStructureDonut';
import { FinanceEmployeeTable } from './components/FinanceEmployeeTable';
import { ComparisonToggle } from './components/ComparisonToggle';
import { FinanceTypeFilters } from './components/FinanceTypeFilters';
import { HotClientsWidget } from './HotClientsWidget';
import { buildFinanceRatingDataset } from '../lib/finance-rating.util';
import { financeClosedCsvData } from '../lib/finance-csv.util';

/** Вкладка «Финансы»: закрытые продажи (разбивка+сравнение) + горячие клиенты. */
export const FinanceReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const departmentItems = useAppSelector(state => state.department.items);
    const { status, report: rawReport, error } = useAppSelector(
        state => state.finance.closed,
    );
    const typeFilters = useAppSelector(state => state.finance.typeFilters);
    // Фильтры по типу договора/клиента: сделки отфильтрованы, итоги
    // сотрудников пересчитаны (без активных фильтров — исходная ссылка).
    const report = React.useMemo(
        () => (rawReport ? filterClosedReportByTypes(rawReport, typeFilters) : null),
        [rawReport, typeFilters],
    );
    const comparison = useAppSelector(state => state.finance.comparison);
    // Сравнение фильтруется теми же типами — иначе дельты обманывают.
    const comparisonReport = React.useMemo(() => {
        const base =
            comparison.mode !== 'off' ? comparison.report : null;
        return base ? filterClosedReportByTypes(base, typeFilters) : null;
    }, [comparison.mode, comparison.report, typeFilters]);
    const comparisonLabel = COMPARISON_MODE_LABELS[comparison.mode];

    // Вкладка монтируется только когда она активна — здесь и грузим данные
    // (thunk-гарды не дадут дублей); фильтры/период берутся из глобального стейта.
    const from = useAppSelector(state => state.report.date.from);
    const to = useAppSelector(state => state.report.date.to);
    const departmentKey = useAppSelector(state =>
        state.department.current.map(user => user.ID).join('_'),
    );
    useEffect(() => {
        if (!from || !to || !departmentKey) return;
        dispatch(getClosedSales());
        dispatch(getHotClients());
        if (comparison.mode !== 'off') {
            dispatch(getComparisonClosedSales());
        }
    }, [dispatch, from, to, departmentKey, comparison.mode]);

    const renderSummary = (data: FinanceClosedReport) => (
        <>
            <FinanceSalesSummary
                totals={data.totals}
                comparisonTotals={comparisonReport?.totals}
                comparisonLabel={comparisonLabel}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <FinanceMonthlyLineChart
                    report={data}
                    comparisonReport={comparisonReport}
                    comparisonLabel={comparisonLabel}
                />
                <FinanceStructureDonut report={data} />
            </div>
            <FinanceEmployeeTable employees={data.employees} />
        </>
    );

    const renderSection = (data: FinanceClosedReport) => (userIds: Set<number>) => {
        const employees = sliceReportByUserIds(data, userIds);
        const comparisonEmployees = comparisonReport
            ? sliceReportByUserIds(comparisonReport, userIds)
            : null;
        return (
            <>
                <FinanceSalesSummary
                    totals={recomputeTotals(employees)}
                    comparisonTotals={
                        comparisonEmployees
                            ? recomputeTotals(comparisonEmployees)
                            : null
                    }
                    comparisonLabel={comparisonLabel}
                />
                <FinanceEmployeeTable employees={employees} />
            </>
        );
    };

    const ratingFooter =
        (data: FinanceClosedReport, label: string) =>
        (sections: StructureSection[]) => (
            <div className="mt-6">
                <EntityRatingChart
                    title={`Победители — ${label} (финансы)`}
                    dataset={buildFinanceRatingDataset(data, departmentItems)}
                    sections={sections}
                />
            </div>
        );

    return (
        <div>
            <ReportBlockWrapper
                blockId="finance-closed"
                title="Продажи"
                onDownload={() => {
                    if (report?.employees.length) {
                        exportTableToCSV(
                            financeClosedCsvData(report, departmentItems),
                            'finance-closed.csv',
                        );
                    }
                }}
            >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    {/* <ComparisonToggle /> TODO допилить сравнение периодов обдуманно */}
                    <div></div>
                    <div className="flex flex-wrap items-center gap-3">
                        <FinanceTypeFilters />
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => dispatch(refreshFinance())}
                        >
                            <RefreshCw className="h-3 w-3" />
                            Пересчитать
                        </Button>
                    </div>
                </div>

                {(status === 'loading' || status === 'idle') && (
                    <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                        <Preloader />
                        <span>Считаем финансовый отчёт…</span>
                    </div>
                )}
                {status === 'error' && (
                    <p className="py-6 text-sm text-destructive">
                        {error || 'Не удалось получить финансовый отчёт'}
                    </p>
                )}
                {status === 'ready' && report && (
                    <ReportGroupTabs
                        presentUserIds={report.employees.map(
                            employee => employee.assignedId,
                        )}
                        renderSummary={() => renderSummary(report)}
                        renderSection={renderSection(report)}
                        renderDepartmentsFooter={ratingFooter(report, 'отделы')}
                        renderGroupsFooter={ratingFooter(report, 'группы')}
                    />
                )}
            </ReportBlockWrapper>

            <HotClientsWidget />
        </div>
    );
};
