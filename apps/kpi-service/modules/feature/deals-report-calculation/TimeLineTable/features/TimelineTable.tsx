import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import { PeriodFilter, TimelineMode } from '../model/types';
import {
    calculateCompanyStats,
    calculateYearlyMatrix,
    getYearsInPeriod,
    getMonthlyLabels,
    calculateMonthlyPayments,
    getDealDuration,
    calculateCrossYearIndexGrowth
} from '../lib/utils/timeline.utils';
import { CompanyStatsComponent } from '../components/CompanyStats';
import { TimelineCell } from '../components/TimelineCell';
import { useApp } from '@/modules/app';
import { cn } from '@workspace/ui/lib/utils';

interface TimelineTableProps {
    companies: OrkReportDealsByCompaniesDto[];
    periodFilter: PeriodFilter;
    timelineMode: TimelineMode;
    expandedCompanies: Set<number>;
    onToggleCompany: (companyId: number) => void;
}

export const TimelineTable: React.FC<TimelineTableProps> = ({
    companies,
    periodFilter,
    timelineMode,
    expandedCompanies,
    onToggleCompany
}) => {
    const { domain } = useApp();
    const monthlyLabels = getMonthlyLabels();
    const years = getYearsInPeriod(new Date(periodFilter.startDate), new Date(periodFilter.endDate));
    const hasMultipleYears = years.length > 1;

    // Фильтрация компаний
    const filteredCompanies = useMemo(() => {
        return companies.filter(companyData => {
            const { company } = companyData;

            // Фильтр по пользователям - скрываем компании без сделок выбранных пользователей
            if (periodFilter.assignedUsers.length > 0) {
                const hasDealWithSelectedUser = companyData.deals.some(deal =>
                    deal.assignedById && periodFilter.assignedUsers.includes(deal.assignedById)
                );
                if (!hasDealWithSelectedUser) return false;
            }

            // Фильтр по статусу клиента
            if (periodFilter.clientStatus === 'active' && !company.isActiveClient) return false;
            if (periodFilter.clientStatus === 'inactive' && company.isActiveClient) return false;

            // Фильтр по индексации
            const stats = calculateCompanyStats(companyData, new Date(periodFilter.startDate), new Date(periodFilter.endDate), periodFilter.assignedUsers);
            if (periodFilter.indexStatus === 'growing' && stats.indexGrowth <= 0) return false;
            if (periodFilter.indexStatus === 'declining' && stats.indexGrowth >= 0) return false;
            if (periodFilter.indexStatus === 'stable' && Math.abs(stats.indexGrowth) > 5) return false;

            return true;
        });
    }, [companies, periodFilter]);

    return (
        <div className="overflow-x-auto max-h-[700px] bg-card rounded-md border">
            <Table className="min-w-[1200px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px] max-w-[150px]">Компания</TableHead>
                        {timelineMode === 'detailed' ? (
                            monthlyLabels.map((month, index) => (
                                <TableHead key={index} className="w-[50px] text-center">
                                    {month}
                                </TableHead>
                            ))
                        ) : (
                            <TableHead className="text-center" colSpan={monthlyLabels.length}>
                                {timelineMode === 'average' ? 'Средние показатели по месяцам' : 'Итоговые показатели по месяцам'}
                            </TableHead>
                        )}
                        {hasMultipleYears && (
                            <TableHead className="w-[100px] text-center">Итоговая индексация</TableHead>
                        )}
                        <TableHead className="w-[200px]">Статистика</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCompanies.map((companyData, index) => {
                        const { company } = companyData;
                        const stats = calculateCompanyStats(companyData, new Date(periodFilter.startDate), new Date(periodFilter.endDate), periodFilter.assignedUsers);
                        const yearlyMatrix = calculateYearlyMatrix(companyData, new Date(periodFilter.startDate), new Date(periodFilter.endDate), periodFilter.assignedUsers);
                        const crossYearIndexes = hasMultipleYears ? calculateCrossYearIndexGrowth(yearlyMatrix) : [];
                        const isExpanded = expandedCompanies.has(company.id);

                        return (
                            <React.Fragment key={company.id}>
                                <TableRow
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => onToggleCompany(company.id)}
                                >
                                    <TableCell className="font-medium w-[150px] max-w-[750px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full">
                                                <div
                                                    className="font-medium truncate text-primary"
                                                    title={company.title}
                                                >
                                                    {company.title}

                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {`   ID в АРМ: ${company.armInfo || 'не установлено'}`}
                                                </p>
                                                <div className="text-xs text-gray-500">
                                                    {company.isActiveClient ? 'Активный клиент' : 'Неактивный клиент'}
                                                </div>
                                                <a
                                                    href={`https://${domain}/crm/company/details/${company.id}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Открыть в CRM
                                                </a>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {timelineMode === 'detailed' ? (
                                        monthlyLabels.map((_, monthIndex) => (
                                            <TableCell key={monthIndex} className="p-1">
                                                <TimelineCell
                                                    yearlyData={yearlyMatrix}
                                                    monthIndex={monthIndex}
                                                    mode={timelineMode}
                                                    years={years}
                                                />
                                            </TableCell>
                                        ))
                                    ) : (
                                        <TableCell colSpan={monthlyLabels.length} className="p-1">
                                            <div className="flex gap-1">
                                                {monthlyLabels.map((_, monthIndex) => (
                                                    <div key={monthIndex} className="flex-1">
                                                        <TimelineCell
                                                            yearlyData={yearlyMatrix}
                                                            monthIndex={monthIndex}
                                                            mode={timelineMode}
                                                            years={years}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                    )}

                                    {hasMultipleYears && (
                                        <TableCell className="p-1">
                                            <div className="flex flex-col gap-0.5">
                                                {crossYearIndexes.map((yearIndex, idx) => {
                                                    // Высота должна соответствовать высоте пары соответствующих полос в таймлайне
                                                    // Если в таймлайне каждая полоса имеет высоту H, то здесь полоса должна иметь высоту 2*H
                                                    // (так как она соответствует двум годам: fromYear и toYear)
                                                    const coefficient = years.length > 1 ? 30 : 16;
                                                    const singleYearHeight = Math.max(8, Math.floor(coefficient / years.length));
                                                    const dynamicHeight = singleYearHeight * 2; // Полоса соответствует двум годам

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
                                        <CompanyStatsComponent stats={stats} />
                                    </TableCell>
                                </TableRow>

                                {/* Выпадающий блок с детализацией по сделкам */}
                                {isExpanded && (
                                    <TableRow>
                                        <TableCell colSpan={monthlyLabels.length + (hasMultipleYears ? 3 : 2)} className="p-0">
                                            <Card className="m-2">
                                                <CardContent className="p-3">
                                                    <div className="text-sm font-medium mb-2">
                                                        Детализация сделок с ежемесячными платежами ({companyData.deals.length} сделок)
                                                    </div>
                                                    <div className="grid gap-2">
                                                        {companyData.deals.map((deal, idx) => {
                                                            const duration = deal.duration || getDealDuration(deal);
                                                            const monthlyAmount = deal.monthSum || (+deal.sum / duration);
                                                            const from = new Date(deal.from);
                                                            const to = new Date(deal.to);
                                                            const payments = calculateMonthlyPayments(deal);
                                                            const isSuccessful = deal.isWon;
                                                            const isLost = deal.isLost;
                                                            return (
                                                                <div
                                                                    key={deal.id}
                                                                    className="border rounded p-3"
                                                                >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <div className="font-medium">
                                                                                    {deal.title || `Сделка #${deal.id}`}
                                                                                </div>
                                                                                <Badge
                                                                                    variant={isSuccessful ? "default" : isLost ? "destructive" : "secondary"}
                                                                                    className={
                                                                                        cn(
                                                                                            'text-xs',
                                                                                            isSuccessful
                                                                                                ? 'text-green-600 bg-green-100'
                                                                                                : isLost ? 'text-red-600 bg-red-100'
                                                                                                    : 'text-yellow-600 bg-yellow-100')
                                                                                    }

                                                                                >
                                                                                    {isSuccessful ? 'Успешная' : isLost ? 'Отказ' : 'В процессе'}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {from.toLocaleDateString('ru-RU')} –{' '}
                                                                                {to.toLocaleDateString('ru-RU')} ({duration} мес)
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                Ответственный: {deal.assignedById || 'Не назначен'}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-semibold text-lg">
                                                                                {(+deal.sum).toLocaleString('ru-RU')} ₽
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {monthlyAmount.toLocaleString('ru-RU')} ₽/мес
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Ежемесячные платежи */}
                                                                    <div className="grid grid-cols-6 gap-1 mt-2">
                                                                        {payments.map((payment, paymentIdx) => {
                                                                            const paymentDate = new Date(from);
                                                                            paymentDate.setMonth(paymentDate.getMonth() + paymentIdx);
                                                                            const monthName = paymentDate.toLocaleDateString('ru-RU', { month: 'short' });

                                                                            return (
                                                                                <div
                                                                                    key={paymentIdx}
                                                                                    className="text-center p-1 bg-muted rounded text-xs"
                                                                                >
                                                                                    <div className="font-medium">{monthName}</div>
                                                                                    <div className="text-green-600">
                                                                                        {payment.amount.toLocaleString('ru-RU')} ₽
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
