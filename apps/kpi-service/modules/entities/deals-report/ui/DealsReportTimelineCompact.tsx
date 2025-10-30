'use client';

import { useMemo, useState } from 'react';
import {
    OrkReportDealItemDto,
    OrkReportDealsByCompaniesDto,
} from '@workspace/nest-api';
import { useDealsReport } from '../hooks/deals-report.hook';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { CalendarIcon } from 'lucide-react';
import { getDealDuration } from '../lib/calculation.util';
import { cn } from '@workspace/ui/lib/utils';
import { useApp } from '@/modules/app';
import Link from 'next/link';

type MonthRange = { year: number; months: string[] };
type PeriodRange = { startYear: number; endYear: number; months: string[] };

interface MonthlyPayment {
    month: number;
    amount: number;
    deal: OrkReportDealItemDto;
}

interface CompanyStats {
    currentTotal: number;
    averageMonthly: number;
    periodTotal: number;
    dealCount: number;
    successRate: number;
    indexGrowth: number; // Индексация роста
}

interface PeriodFilter {
    startDate: Date;
    endDate: Date;
    clientStatus: 'all' | 'active' | 'inactive';
    indexStatus: 'all' | 'growing' | 'declining' | 'stable';
}

interface YearlyData {
    year: number;
    monthlyTotals: number[];
}

type TimelineMode = 'detailed' | 'average' | 'total';

function getMonthsOfYear(year: number): MonthRange {
    const months = Array.from({ length: 12 }).map((_, i) =>
        new Date(year, i, 1).toLocaleString('ru-RU', { month: 'short' }),
    );
    return { year, months };
}

function getYearsInPeriod(startDate: Date, endDate: Date): number[] {
    const years: number[] = [];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
        years.push(year);
    }
    return years;
}

function getMonthlyLabels(): string[] {
    return Array.from({ length: 12 }).map((_, i) =>
        new Date(2024, i, 1).toLocaleString('ru-RU', { month: 'short' }),
    );
}

function getMinDateFromDeals(companies: OrkReportDealsByCompaniesDto[]): Date {
    let minDate = new Date();

    companies.forEach(companyData => {
        companyData.deals.forEach(deal => {
            const dealDate = new Date(deal.from);
            if (dealDate < minDate) {
                minDate = dealDate;
            }
        });
    });

    return minDate;
}

function calculateIndexGrowth(deals: OrkReportDealItemDto[]): number {
    if (deals.length < 2) return 0;

    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
    const firstDeal = sortedDeals[0];
    const lastDeal = sortedDeals[sortedDeals.length - 1];

    if (!firstDeal || !lastDeal) return 0;

    const firstSum = +firstDeal.sum;
    const lastSum = +lastDeal.sum;

    if (firstSum === 0) return 0;

    return ((lastSum - firstSum) / firstSum) * 100;
}

function getDealColor(current: number, previous?: number, sumTotal?: number) {
    // Если нет суммы вообще
    if (current === 0) return 'bg-gray-400';

    // Если есть предыдущее значение для сравнения
    if (previous !== undefined) {
        if (current > previous) return 'bg-green-600';
        if (current < previous) return 'bg-red-500';
        return 'bg-blue-400'; // Если равны
    }

    // Если есть сумма, но нет предыдущего значения для сравнения
    if (current > 0) return 'bg-blue-400';

    // По умолчанию серый
    return 'bg-gray-400';
}

function calculateMonthlyPayments(deal: OrkReportDealItemDto): MonthlyPayment[] {
    const from = new Date(deal.from);
    const to = new Date(deal.to);
    const totalSum = +deal.sum;
    const duration = deal.duration || getDealDuration(deal);
    const monthlyAmount = deal.monthSum || (totalSum / duration);

    const payments: MonthlyPayment[] = [];

    // Рассчитываем платежи на основе реальной длительности сделки
    const actualDuration = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const actualDurationMonths = Math.max(1, actualDuration); // Минимум 1 месяц

    for (let i = 0; i < actualDurationMonths; i++) {
        const paymentDate = new Date(from);
        paymentDate.setMonth(paymentDate.getMonth() + i);

        // Проверяем, что платеж не выходит за рамки сделки
        if (paymentDate <= to) {
            payments.push({
                month: paymentDate.getMonth(),
                amount: monthlyAmount,
                deal
            });
        }
    }

    return payments;
}

function calculateCompanyStats(companyData: OrkReportDealsByCompaniesDto, startDate: Date, endDate: Date): CompanyStats {
    const { deals } = companyData;

    // Фильтруем сделки, которые пересекаются с выбранным периодом
    const periodDeals = deals.filter(deal => {
        const dealFrom = new Date(deal.from);
        const dealTo = new Date(deal.to);
        // Сделка пересекается с периодом, если она начинается до конца периода и заканчивается после начала периода
        return dealFrom <= endDate && dealTo >= startDate;
    });

    // Рассчитываем общую сумму всех сделок (включая пересекающиеся)
    const totalSum = periodDeals.reduce((sum, deal) => sum + +deal.sum, 0);
    const successfulDeals = periodDeals.filter(deal => deal.isWon || deal.isInProgress).length;

    // Рассчитываем ежемесячные платежи с учетом пересекающихся сделок
    const monthlyPayments = periodDeals.flatMap(deal => calculateMonthlyPayments(deal));

    // Группируем платежи по месяцам и суммируем (для учета пересекающихся сделок)
    const monthlyTotals = new Map<number, number>();
    monthlyPayments.forEach(payment => {
        const month = payment.month;
        monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + payment.amount);
    });

    // Рассчитываем общую сумму за период (сумма всех ежемесячных платежей)
    const currentTotal = Array.from(monthlyTotals.values()).reduce((sum, amount) => sum + amount, 0);

    // Рассчитываем среднюю сумму в месяц
    const totalMonths = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const averageMonthly = totalMonths > 0 ? currentTotal / totalMonths : 0;

    const indexGrowth = calculateIndexGrowth(periodDeals);

    return {
        currentTotal,
        averageMonthly,
        periodTotal: totalSum,
        dealCount: periodDeals.length,
        successRate: periodDeals.length > 0 ? (successfulDeals / periodDeals.length) * 100 : 0,
        indexGrowth
    };
}

function calculateYearlyMatrix(companyData: OrkReportDealsByCompaniesDto, startDate: Date, endDate: Date): YearlyData[] {
    const { deals } = companyData;
    const years = getYearsInPeriod(startDate, endDate);

    // Сначала получаем все сделки, которые пересекаются с общим периодом
    const periodDeals = deals.filter(deal => {
        const dealFrom = new Date(deal.from);
        const dealTo = new Date(deal.to);
        return dealFrom <= endDate && dealTo >= startDate;
    });

    return years.map(year => {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);

        // Фильтруем сделки, которые пересекаются с конкретным годом
        const yearDeals = periodDeals.filter(deal => {
            const dealFrom = new Date(deal.from);
            const dealTo = new Date(deal.to);
            return dealFrom <= yearEnd && dealTo >= yearStart;
        });

        // Рассчитываем ежемесячные платежи для всех сделок года
        const monthlyPayments = yearDeals.flatMap(deal => calculateMonthlyPayments(deal));

        // Группируем платежи по месяцам и суммируем (для учета пересекающихся сделок)
        const monthlyTotals = Array.from({ length: 12 }).map((_, month) => {
            const monthPayments = monthlyPayments.filter(payment => {
                const paymentDate = new Date(payment.deal.from);
                paymentDate.setMonth(paymentDate.getMonth() + payment.month);
                return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
            });

            // Суммируем все платежи за месяц (включая пересекающиеся сделки)
            return monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
        });

        return {
            year,
            monthlyTotals
        };
    });
}

export const DealsReportTimelineCompact = () => {
    const { deals: companies, isLoading, error } = useDealsReport();
    const { domain } = useApp()
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 11, 31),
        clientStatus: 'all',
        indexStatus: 'all'
    });
    const [timelineMode, setTimelineMode] = useState<TimelineMode>('detailed');
    const [expandedCompanies, setExpanded] = useState<Set<number>>(new Set());

    const years = useMemo(() => getYearsInPeriod(periodFilter.startDate, periodFilter.endDate), [periodFilter.startDate, periodFilter.endDate]);
    const monthlyLabels = useMemo(() => getMonthlyLabels(), []);

    const filteredCompanies = useMemo(() => {
        if (!companies) return [];

        return companies.filter((company: OrkReportDealsByCompaniesDto) => {
            // Фильтр по статусу клиента
            const clientStatusMatch = periodFilter.clientStatus === 'all' ||
                (periodFilter.clientStatus === 'active' && company.company.isActiveClient) ||
                (periodFilter.clientStatus === 'inactive' && !company.company.isActiveClient);

            if (!clientStatusMatch) return false;

            // Фильтр по индексации
            if (periodFilter.indexStatus === 'all') return true;

            const stats = calculateCompanyStats(company, periodFilter.startDate, periodFilter.endDate);

            if (periodFilter.indexStatus === 'growing') return stats.indexGrowth > 5; // Рост > 5%
            if (periodFilter.indexStatus === 'declining') return stats.indexGrowth < -5; // Падение > 5%
            if (periodFilter.indexStatus === 'stable') return stats.indexGrowth >= -5 && stats.indexGrowth <= 5; // Стабильно ±5%

            return true;
        });
    }, [companies, periodFilter.clientStatus, periodFilter.indexStatus, periodFilter.startDate, periodFilter.endDate]);

    const toggleCompany = (id: number) => {
        const newSet = new Set(expandedCompanies);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpanded(newSet);
    };

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                Загрузка...
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center h-64 text-destructive">
                Ошибка: {error}
            </div>
        );

    if (!companies || companies.length === 0)
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                Нет данных для отображения
            </div>
        );

    return (
        <div className="space-y-4">
            {/* Заголовок и фильтры */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Таймлайн сделок с ежемесячными платежами</h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Период:</label>
                        <Select
                            onValueChange={(val) => {
                                const year = Number(val);
                                setPeriodFilter(prev => {
                                    const newStartDate = new Date(year, 0, 1);
                                    // Если новый startDate больше endDate, обновляем endDate
                                    const newEndDate = newStartDate > prev.endDate ? new Date(year, 11, 31) : prev.endDate;
                                    return {
                                        ...prev,
                                        startDate: newStartDate,
                                        endDate: newEndDate
                                    };
                                });
                            }}
                            defaultValue={String(periodFilter.startDate.getFullYear())}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="От" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies && (() => {
                                    const minDate = getMinDateFromDeals(companies);
                                    const minYear = minDate.getFullYear();
                                    const currentYear = new Date().getFullYear();
                                    const years = [];
                                    for (let year = minYear; year <= currentYear + 2; year++) {
                                        years.push(year);
                                    }
                                    return years;
                                })().map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm">-</span>
                        <Select
                            onValueChange={(val) => {
                                const year = Number(val);
                                setPeriodFilter(prev => {
                                    const newEndDate = new Date(year, 11, 31);
                                    // Если новый endDate меньше startDate, обновляем startDate
                                    const newStartDate = newEndDate < prev.startDate ? new Date(year, 0, 1) : prev.startDate;
                                    return {
                                        ...prev,
                                        startDate: newStartDate,
                                        endDate: newEndDate
                                    };
                                });
                            }}
                            defaultValue={String(periodFilter.endDate.getFullYear())}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="До" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies && (() => {
                                    const minDate = getMinDateFromDeals(companies);
                                    const minYear = minDate.getFullYear();
                                    const currentYear = new Date().getFullYear();
                                    const years = [];
                                    for (let year = minYear; year <= currentYear + 2; year++) {
                                        years.push(year);
                                    }
                                    return years;
                                })().map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Режим:</label>
                        <Select
                            onValueChange={(val) => setTimelineMode(val as TimelineMode)}
                            defaultValue={timelineMode}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Режим" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="detailed">Детализация</SelectItem>
                                <SelectItem value="average">Средние</SelectItem>
                                <SelectItem value="total">Итого</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Клиенты:</label>
                        <Select
                            onValueChange={(val) => setPeriodFilter(prev => ({ ...prev, clientStatus: val as any }))}
                            defaultValue={periodFilter.clientStatus}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="active">Активные</SelectItem>
                                <SelectItem value="inactive">Неактивные</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Индексация:</label>
                        <Select
                            onValueChange={(val) => setPeriodFilter(prev => ({ ...prev, indexStatus: val as any }))}
                            defaultValue={periodFilter.indexStatus}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Индексация" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="growing">Растущие</SelectItem>
                                <SelectItem value="declining">Падающие</SelectItem>
                                <SelectItem value="stable">Стабильные</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Badge variant="outline">{filteredCompanies.length} компаний</Badge>
                </div>
            </div>

            {/* Таблица */}
            <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[1200px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[240px]">Компания</TableHead>
                            {timelineMode === 'detailed' ? (
                                monthlyLabels.map((m, i) => (
                                    <TableHead key={i} className="text-center text-xs w-[50px]">
                                        {m}
                                    </TableHead>
                                ))
                            ) : (
                                <TableHead className="text-center text-xs w-[600px]">
                                    {timelineMode === 'average' ? 'Средние показатели' : 'Итого за период'}
                                </TableHead>
                            )}
                            <TableHead className="text-center text-xs w-[100px]">Текущий</TableHead>
                            <TableHead className="text-center text-xs w-[100px]">Средний</TableHead>
                            <TableHead className="text-center text-xs w-[120px]">Итого за период</TableHead>
                            <TableHead className="text-center text-xs w-[100px]">Индексация</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredCompanies.map((companyData: OrkReportDealsByCompaniesDto) => {
                            const { company, deals } = companyData;
                            const sortedDeals = [...deals].sort(
                                (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
                            );

                            const stats = calculateCompanyStats(companyData, periodFilter.startDate, periodFilter.endDate);
                            const yearlyMatrix = calculateYearlyMatrix(companyData, periodFilter.startDate, periodFilter.endDate);

                            return (
                                <>
                                    {/* Основная строка с информацией о компании */}
                                    <TableRow
                                        key={company.id}
                                        className={cn(
                                            "cursor-pointer hover:bg-muted/50",
                                            !company.isActiveClient
                                                ? 'bg-muted/90 opacity-50'
                                                : ''
                                        )}
                                        onClick={() => toggleCompany(company.id)}
                                    >
                                        <TableCell className="w-[240px] max-w-[240px]">
                                            <div className="truncate font-medium flex flex-col items-center gap-2">
                                                <p className="truncate">
                                                    {company.title}
                                                </p>
                                                <p className={cn(
                                                    "text-xs text-muted-foreground",
                                                    company.isActiveClient ? 'text-green-500' : 'text-red-500'
                                                )}>{company.isActiveClient ? 'Активный клиент' : 'Не активный клиент'}</p>
                                                <Link href={`https://${domain}/crm/company/details/${company.id}/`} target="_blank">
                                                    открыть в bx
                                                </Link>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Сделок: {deals.length} | Успешных: {Math.round(stats.successRate)}%
                                            </div>
                                        </TableCell>

                                        {/* Таймлайн в зависимости от режима */}
                                        {timelineMode === 'detailed' ? (
                                            // Детализированный режим - матрица по месяцам с годами в одной строке
                                            monthlyLabels.map((month, monthIndex) => {
                                                const totalForMonth = yearlyMatrix.reduce((sum, yearData) =>
                                                    sum + (yearData.monthlyTotals[monthIndex] || 0), 0
                                                );
                                                const prevTotal = monthIndex > 0 ? yearlyMatrix.reduce((sum, yearData) =>
                                                    sum + (yearData.monthlyTotals[monthIndex - 1] || 0), 0
                                                ) : undefined;
                                                const color = getDealColor(totalForMonth, prevTotal);

                                                return (
                                                    <TableCell key={monthIndex} className="text-center p-0 relative">
                                                        <div className="flex flex-col gap-0.5">
                                                            {/* Сводная строка */}
                                                            {/* <div
                                                                className={cn(
                                                                    'h-3 transition-colors duration-200 rounded-sm flex items-center justify-center text-white text-xs font-medium',
                                                                    color,
                                                                )}
                                                                title={`${month}: ${totalForMonth.toLocaleString('ru-RU')} ₽`}
                                                            >
                                                                {totalForMonth > 0 && (
                                                                    <span className="text-xs">
                                                                        {(totalForMonth / 1000).toFixed(0)}К
                                                                    </span>
                                                                )}
                                                            </div> */}
                                                            {/* Годовые строки */}
                                                            {years.map((year) => {
                                                                const yearData = yearlyMatrix.find(y => y.year === year);
                                                                const amount = yearData?.monthlyTotals[monthIndex] || 0;
                                                                const prevAmount = monthIndex > 0 ? (yearData?.monthlyTotals[monthIndex - 1] || 0) : undefined;
                                                                const yearColor = getDealColor(amount, prevAmount, amount);

                                                                return (
                                                                    <div
                                                                        key={year}
                                                                        className={cn(
                                                                            years.length > 3 ? 'h-2 ' : years.length > 1 ? 'h-3' : 'h-5 ',
                                                                            'transition-colors duration-200 rounded-sm flex items-center justify-center text-white text-xs font-medium mx-2',
                                                                            yearColor,
                                                                        )}
                                                                        title={`${year} ${month}: ${amount.toLocaleString('ru-RU')} ₽`}
                                                                    >
                                                                        {amount > 0 && (
                                                                            <span className="text-xs">
                                                                                {(amount / 1000).toFixed(0)}К
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </TableCell>
                                                );
                                            })
                                        ) : timelineMode === 'average' ? (
                                            // Режим средних показателей - одна полоса
                                            <TableCell colSpan={12} className="text-center p-0 relative">
                                                <div
                                                    className={cn(
                                                        'h-4 transition-colors duration-200 rounded-sm flex items-center justify-center text-white text-xs font-medium bg-blue-500',
                                                    )}
                                                    title={`Средний показатель: ${stats.averageMonthly.toLocaleString('ru-RU')} ₽/мес`}
                                                >
                                                    <span className="text-xs">
                                                        {(stats.averageMonthly / 1000).toFixed(0)}К/мес
                                                    </span>
                                                </div>
                                            </TableCell>
                                        ) : (
                                            // Режим итого - одна полоса
                                            <TableCell colSpan={12} className="text-center p-0 relative">
                                                <div
                                                    className={cn(
                                                        'h-4 transition-colors duration-200 rounded-sm flex items-center justify-center text-white text-xs font-medium bg-purple-500',
                                                    )}
                                                    title={`Итого за период: ${stats.periodTotal.toLocaleString('ru-RU')} ₽`}
                                                >
                                                    <span className="text-xs">
                                                        {(stats.periodTotal / 1000).toFixed(0)}К
                                                    </span>
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Текущий показатель */}
                                        <TableCell className="text-center">
                                            <div className="text-sm font-semibold text-blue-600">
                                                {stats.currentTotal.toLocaleString('ru-RU')} ₽
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                за {periodFilter.startDate.getFullYear() === periodFilter.endDate.getFullYear()
                                                    ? periodFilter.startDate.getFullYear()
                                                    : `${periodFilter.startDate.getFullYear()}-${periodFilter.endDate.getFullYear()}`} год
                                            </div>
                                        </TableCell>

                                        {/* Средний показатель */}
                                        <TableCell className="text-center">
                                            <div className="text-sm font-semibold text-green-600">
                                                {stats.averageMonthly.toLocaleString('ru-RU')} ₽
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                в месяц
                                            </div>
                                        </TableCell>

                                        {/* Итого за период */}
                                        <TableCell className="text-center">
                                            <div className="text-sm font-semibold text-purple-600">
                                                {stats.periodTotal.toLocaleString('ru-RU')} ₽
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {stats.dealCount} сделок
                                            </div>
                                        </TableCell>

                                        {/* Индексация */}
                                        <TableCell className="text-center">
                                            <div className={cn(
                                                "text-sm font-semibold",
                                                stats.indexGrowth > 0 ? "text-green-600" :
                                                    stats.indexGrowth < 0 ? "text-red-600" : "text-gray-600"
                                            )}>
                                                {stats.indexGrowth > 0 ? '+' : ''}{stats.indexGrowth.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                рост/падение
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {expandedCompanies.has(company.id) && (
                                        <TableRow>
                                            <TableCell colSpan={monthlyLabels.length + 5} className="p-0">
                                                <Card className="m-2">
                                                    <CardContent className="p-3">
                                                        <div className="text-sm font-medium mb-2">
                                                            Детализация сделок с ежемесячными платежами
                                                        </div>
                                                        <div className="grid gap-2">
                                                            {sortedDeals.map((deal, idx) => {
                                                                const duration = deal.duration || getDealDuration(deal);
                                                                const monthlyAmount = deal.monthSum || (+deal.sum / duration);
                                                                const from = new Date(deal.from);
                                                                const to = new Date(deal.to);
                                                                const payments = calculateMonthlyPayments(deal);

                                                                return (
                                                                    <div
                                                                        key={deal.id}
                                                                        className="border rounded p-3"
                                                                    >
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div className="flex-1">
                                                                                <div className="font-medium">
                                                                                    {deal.title}
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    {from.toLocaleDateString('ru-RU')} –{' '}
                                                                                    {to.toLocaleDateString('ru-RU')} ({duration} мес)
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
                                </>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="text-sm text-muted-foreground text-center">
                <div className="mb-2">
                    Цвет отрезков показывает изменение ежемесячных платежей: 🟩 рост, 🟥 падение
                </div>
                <div className="flex justify-center gap-6 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Рост платежей</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Падение платежей</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-400 rounded"></div>
                        <span>Стабильно</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
