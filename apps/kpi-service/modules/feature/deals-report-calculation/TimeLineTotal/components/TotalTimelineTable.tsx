import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import { PeriodFilter } from '../../TimeLineTable/model/types';
import {
    calculateYearlyMatrix,
    getYearsInPeriod,
    getMonthlyLabels,
    calculateCrossYearIndexGrowth,
    filterDealsByUsers,
    calculateCompanyStats
} from '../../TimeLineTable/lib/utils/timeline.utils';
import { TimelineCell } from '../../TimeLineTable/components/TimelineCell';
import { cn } from '@workspace/ui/lib/utils';

interface TotalTimelineTableProps {
    companies: OrkReportDealsByCompaniesDto[];
    periodFilter: PeriodFilter;
}

export const TotalTimelineTable: React.FC<TotalTimelineTableProps> = ({
    companies,
    periodFilter
}) => {
    const monthlyLabels = getMonthlyLabels();
    const years = getYearsInPeriod(new Date(periodFilter.startDate), new Date(periodFilter.endDate));
    const hasMultipleYears = years.length > 1;

    // Объединяем все сделки из всех компаний
    const allDeals = useMemo(() => {
        return companies.flatMap(company => {
            let deals = company.deals;
            // Фильтруем сделки по пользователям
            if (periodFilter.assignedUsers.length > 0) {
                deals = filterDealsByUsers(deals, periodFilter.assignedUsers);
            }
            return deals;
        });
    }, [companies, periodFilter.assignedUsers]);

    // Создаем виртуальную компанию со всеми сделками
    const totalCompanyData: OrkReportDealsByCompaniesDto = useMemo(() => {
        return {
            company: {
                id: 0,
                title: 'ИТОГО',
                isActiveClient: true,
                armInfo: '',
                assignedById: '0',
                history: []
            },
            deals: allDeals
        };
    }, [allDeals]);

    // Рассчитываем матрицу по годам для итоговой компании
    const yearlyMatrix = useMemo(() => {
        return calculateYearlyMatrix(
            totalCompanyData,
            new Date(periodFilter.startDate),
            new Date(periodFilter.endDate),
            periodFilter.assignedUsers
        );
    }, [totalCompanyData, periodFilter.startDate, periodFilter.endDate, periodFilter.assignedUsers]);

    // Рассчитываем итоговую индексацию
    const crossYearIndexes = hasMultipleYears ? calculateCrossYearIndexGrowth(yearlyMatrix) : [];

    return (
        <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-primary">Итоговая статистика по всем компаниям</h2>
            <div className="overflow-x-auto">
                <Table className="min-w-[1200px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px] max-w-[150px]">Показатель</TableHead>
                            {monthlyLabels.map((month, index) => (
                                <TableHead key={index} className="w-[50px] text-center">
                                    {month}
                                </TableHead>
                            ))}
                            {hasMultipleYears && (
                                <TableHead className="w-[100px] text-center">Итоговая индексация</TableHead>
                            )}
                            <TableHead className="w-[200px]">Статистика</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="">
                            <TableCell className="font-medium">
                                <div className="text-lg font-semibold text-primary">ИТОГО</div>
                            </TableCell>
                            {monthlyLabels.map((_, monthIndex) => (
                                <TableCell key={monthIndex} className="p-1">
                                    <TimelineCell
                                        yearlyData={yearlyMatrix}
                                        monthIndex={monthIndex}
                                        mode="detailed"
                                        years={years}
                                    />
                                </TableCell>
                            ))}
                            {hasMultipleYears && (
                                <TableCell className="p-1">
                                    <div className="flex flex-col gap-0.5">
                                        {crossYearIndexes.map((yearIndex) => {
                                            const coefficient = years.length > 1 ? 30 : 16;
                                            const singleYearHeight = Math.max(8, Math.floor(coefficient / years.length));
                                            const dynamicHeight = singleYearHeight * 2;

                                            return (
                                                <div
                                                    key={`${yearIndex.fromYear}-${yearIndex.toYear}`}
                                                    className={cn(
                                                        "rounded text-xs flex items-center justify-center font-medium text-white",
                                                        yearIndex.indexGrowth > 0 ? "bg-green-600" :
                                                            yearIndex.indexGrowth < 0 ? "bg-red-600" :
                                                                "bg-gray-400"
                                                    )}
                                                    style={{ height: `${dynamicHeight}px` }}
                                                >
                                                    {yearIndex.indexGrowth !== 0
                                                        ? `${yearIndex.indexGrowth >= 0 ? '+' : ''}${yearIndex.indexGrowth.toFixed(1)}%`
                                                        : '-'
                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                </TableCell>
                            )}
                            <TableCell>
                                {(() => {
                                    const totalStats = calculateCompanyStats(
                                        totalCompanyData,
                                        new Date(periodFilter.startDate),
                                        new Date(periodFilter.endDate),
                                        periodFilter.assignedUsers
                                    );

                                    return (
                                        <div className="text-sm space-y-1">
                                            <div className="font-semibold mb-2">Общая статистика</div>
                                            <div className="text-xs space-y-0.5">
                                                <div>Компаний: {companies.length}</div>
                                                <div>Сделок: {allDeals.length}</div>
                                                <div className="mt-2 pt-2 border-t">
                                                    <div>За период: {Math.round(totalStats.periodTotal).toLocaleString('ru-RU')} ₽</div>
                                                    <div>Среднемесячно: {Math.round(totalStats.averageMonthly).toLocaleString('ru-RU')} ₽</div>
                                                    <div>Индексация: {totalStats.indexGrowth >= 0 ? '+' : ''}{totalStats.indexGrowth.toFixed(1)}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};

