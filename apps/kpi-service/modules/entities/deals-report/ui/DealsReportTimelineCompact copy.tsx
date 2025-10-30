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
import { getDealDuration } from '../lib/calculation.util';
import { cn } from '@workspace/ui/lib/utils';

type MonthRange = { year: number; months: string[] };

function getMonthsOfYear(year: number): MonthRange {
    const months = Array.from({ length: 12 }).map((_, i) =>
        new Date(year, i, 1).toLocaleString('ru-RU', { month: 'short' }),
    );
    return { year, months };
}

function getDealColor(current: number, previous?: number) {
    if (previous === undefined) return 'bg-gray-400';
    if (current > previous) return 'bg-green-500';
    if (current < previous) return 'bg-red-500';
    return 'bg-gray-400';
}

function monthIndex(date: string): number {
    const d = new Date(date);
    return d.getMonth();
}

export const DealsReportTimelineCompact = () => {
    const { deals: companies, isLoading, error } = useDealsReport();
    const [year, setYear] = useState<number>(2025);
    const [expandedCompanies, setExpanded] = useState<Set<number>>(new Set());

    const months = useMemo(() => getMonthsOfYear(year), [year]);

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
            {/* Заголовок и фильтр */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Таймлайн сделок</h1>
                <div className="flex items-center gap-3">
                    <Select
                        onValueChange={(val) => setYear(Number(val))}
                        defaultValue={String(year)}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Выбрать год" />
                        </SelectTrigger>
                        <SelectContent>
                            {[2023, 2024, 2025, 2026].map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Badge variant="outline">{companies.length} компаний</Badge>
                </div>
            </div>

            {/* Таблица */}
            <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[900px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[240px]">Компания</TableHead>
                            {months.months.map((m, i) => (
                                <TableHead key={i} className="text-center text-xs w-[60px]">
                                    {m}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {companies.map((companyData: OrkReportDealsByCompaniesDto) => {
                            const { company, deals } = companyData;
                            const sortedDeals = [...deals].sort(
                                (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
                            );

                            // Для цветовых отрезков по месяцам
                            const monthCells = Array.from({ length: 12 }).map(() => null as OrkReportDealItemDto | null);

                            sortedDeals.forEach((deal, index) => {
                                const from = new Date(deal.from);
                                const to = new Date(deal.to);
                                const fromMonth = from.getFullYear() === year ? from.getMonth() : 0;
                                const toMonth = to.getFullYear() === year ? to.getMonth() : 11;

                                for (let m = fromMonth; m <= toMonth; m++) {
                                    monthCells[m] = deal;
                                }
                            });

                            return (
                                <>
                                    <TableRow
                                        key={company.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => toggleCompany(company.id)}
                                    >
                                        <TableCell className="w-[240px] max-w-[240px]">
                                            <div className="truncate font-medium">{company.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Сделок: {deals.length}
                                            </div>
                                        </TableCell>

                                        {monthCells.map((deal, i) => {
                                            if (!deal)
                                                return (
                                                    <TableCell key={i} className="bg-muted text-center p-0">
                                                        <div className="h-6" />
                                                    </TableCell>
                                                );

                                            const prevDeal =
                                                i > 0 ? monthCells[i - 1] : undefined;
                                            const color = getDealColor(
                                                +deal.sum,
                                                prevDeal ? +prevDeal.sum : undefined,
                                            );

                                            return (
                                                <TableCell key={i} className="text-center p-0 relative">
                                                    <div
                                                        className={cn(
                                                            'h-6 transition-colors duration-200 rounded-sm',
                                                            color,
                                                        )}
                                                        title={`${deal.title}\n${(+deal.sum).toLocaleString(
                                                            'ru-RU',
                                                        )} ₽`}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>

                                    {expandedCompanies.has(company.id) && (
                                        <TableRow>
                                            <TableCell colSpan={13} className="p-0">
                                                <Card className="m-2">
                                                    <CardContent className="p-3">
                                                        <div className="text-sm font-medium mb-2">
                                                            Детализация сделок
                                                        </div>
                                                        <div className="grid gap-2">
                                                            {sortedDeals.map((deal, idx) => {
                                                                const duration = getDealDuration(deal);
                                                                const from = new Date(deal.from);
                                                                const to = new Date(deal.to);
                                                                return (
                                                                    <div
                                                                        key={deal.id}
                                                                        className="flex justify-between text-sm border rounded p-2"
                                                                    >
                                                                        <div className="flex-1">
                                                                            <div className="font-medium">
                                                                                {deal.title}
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {from.toLocaleDateString('ru-RU')} –{' '}
                                                                                {to.toLocaleDateString('ru-RU')} ({duration} мес)
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right font-semibold">
                                                                            {(+deal.sum).toLocaleString('ru-RU')} ₽
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
                Цвет отрезков показывает изменение суммы между сделками: 🟩 рост, 🟥 падение
            </div>
        </div>
    );
};
