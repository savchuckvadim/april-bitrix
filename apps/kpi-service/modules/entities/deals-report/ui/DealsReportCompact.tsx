'use client'

import { useState } from 'react';
import { OrkReportDealItemDto, OrkReportDealsByCompaniesDto } from "@workspace/nest-api";
import { useDealsReport } from "../hooks/deals-report.hook";
import { getDealDuration } from "../lib/calculation.util";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";

// Микро-диаграмма динамики сделок
const DealTrendChart = ({ deals }: { deals: OrkReportDealItemDto[] }) => {
    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    if (sortedDeals.length < 2) {
        return <div className="text-xs text-muted-foreground">—</div>;
    }

    const sums = sortedDeals.map(deal => +deal.sum);
    const minSum = Math.min(...sums);
    const maxSum = Math.max(...sums);
    const range = maxSum - minSum;

    if (range === 0) {
        return <div className="text-xs text-muted-foreground">—</div>;
    }

    const width = 60;
    const height = 20;
    const points = sums.map((sum, index) => {
        const x = (index / (sums.length - 1)) * width;
        const y = height - ((sum - minSum) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const lastSum = sums[sums.length - 1];
    const firstSum = sums[0];
    const isGrowing = lastSum && firstSum ? lastSum > firstSum : false;
    const growthPercent = firstSum && lastSum ? ((lastSum - firstSum) / firstSum) * 100 : 0;

    return (
        <div className="flex items-center gap-2">
            <svg width={width} height={height} className="flex-shrink-0">
                <polyline
                    points={points}
                    fill="none"
                    stroke={isGrowing ? "#22c55e" : "#ef4444"}
                    strokeWidth="1.5"
                />
                <circle
                    cx={points.split(' ').at(-1)?.split(',')[0] || '0'}
                    cy={points.split(' ').at(-1)?.split(',')[1] || '0'}
                    r="2"
                    fill={isGrowing ? "#22c55e" : "#ef4444"}
                />
            </svg>
            <div className="text-xs">
                <div className={`font-medium ${isGrowing ? 'text-green-600' : 'text-red-600'}`}>
                    {isGrowing ? '↗' : '↘'} {Math.abs(growthPercent).toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

// Компактная информация о сделках в строке
const DealsSummary = ({ deals }: { deals: OrkReportDealItemDto[] }) => {
    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
    const totalSum = deals.reduce((sum, deal) => sum + +deal.sum, 0);
    const avgSum = totalSum / deals.length;
    const latestDeal = sortedDeals[sortedDeals.length - 1];
    const prevDeal = sortedDeals[sortedDeals.length - 2];
    const latestGrowth = prevDeal && latestDeal ? (((+latestDeal.sum - +prevDeal.sum) / +prevDeal.sum) * 100) : null;

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{deals.length} сделок</span>
                <span className="text-xs text-muted-foreground">
                    {totalSum.toLocaleString('ru-RU')} ₽
                </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">ср: {avgSum.toLocaleString('ru-RU')} ₽</span>
                {latestGrowth !== null && (
                    <Badge
                        variant={latestGrowth > 0 ? "default" : "destructive"}
                        className="text-xs px-1 py-0"
                    >
                        {latestGrowth > 0 ? '↗' : '↘'} {Math.abs(latestGrowth).toFixed(0)}%
                    </Badge>
                )}
            </div>
        </div>
    );
};

// Детализация сделок с переносами
const DealsDetailExpanded = ({ deals }: { deals: OrkReportDealItemDto[] }) => {
    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    return (
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
            {sortedDeals.map((deal, index) => {
                const prevDeal = sortedDeals[index - 1];
                const growth = prevDeal && prevDeal.sum
                    ? (((+deal.sum - +prevDeal.sum) / +prevDeal.sum) * 100)
                    : null;

                const duration = getDealDuration(deal);
                const fromDate = new Date(deal.from);
                const toDate = new Date(deal.to);

                return (
                    <div key={deal.id} className="flex items-start justify-between py-2 px-3 bg-background rounded border">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm break-words">{deal.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <div>{fromDate.toLocaleDateString('ru-RU')} - {toDate.toLocaleDateString('ru-RU')}</div>
                                    <div>Период: {duration} мес. • Статус: {deal.status}</div>
                                    {deal.complectName && (
                                        <div>Комплект: {deal.complectName}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            <div className="text-right">
                                <div className="font-semibold text-sm">
                                    {(+deal.sum).toLocaleString('ru-RU')} ₽
                                </div>
                                {growth !== null && (
                                    <Badge
                                        variant={growth > 0 ? "default" : "destructive"}
                                        className="text-xs mt-1"
                                    >
                                        {growth > 0 ? '↗' : '↘'} {Math.abs(growth).toFixed(1)}%
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Компонент строки таблицы
const CompanyRowCompact = ({ companyData, isExpanded, onToggle }: {
    companyData: OrkReportDealsByCompaniesDto,
    isExpanded: boolean,
    onToggle: () => void
}) => {
    const { company, deals } = companyData;
    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    // Расчет метрик
    const totalSum = deals.reduce((sum, deal) => sum + +deal.sum, 0);
    const firstDeal = sortedDeals[0];
    const lastDeal = sortedDeals[sortedDeals.length - 1];
    const totalGrowth = firstDeal && lastDeal && firstDeal !== lastDeal
        ? (((+lastDeal.sum - +firstDeal.sum) / +firstDeal.sum) * 100)
        : null;

    const avgDuration = deals.reduce((sum, deal) => sum + getDealDuration(deal), 0) / deals.length;
    const latestDeal = lastDeal;

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={onToggle}
            >
                {/* Компания - ограниченная ширина */}
                <TableCell className="w-[200px] max-w-[200px]">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                        >
                            {isExpanded ? '▼' : '▶'}
                        </Button>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate" title={company.title}>
                                {company.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                ARM: {company.armInfo || 'не установлено'}
                            </div>
                        </div>
                    </div>
                </TableCell>

                {/* Сводка по сделкам */}
                <TableCell className="w-[180px]">
                    <DealsSummary deals={deals} />
                </TableCell>

                {/* Микро-диаграмма */}
                <TableCell className="w-[120px]">
                    <DealTrendChart deals={deals} />
                </TableCell>

                {/* Общий рост */}
                <TableCell className="w-[100px] text-right">
                    {totalGrowth !== null ? (
                        <Badge
                            variant={totalGrowth > 0 ? "default" : "destructive"}
                            className="text-xs"
                        >
                            {totalGrowth > 0 ? '↗' : '↘'} {Math.abs(totalGrowth).toFixed(0)}%
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                    )}
                </TableCell>

                {/* Средний период */}
                <TableCell className="w-[80px] text-center text-sm">
                    {avgDuration.toFixed(1)}м
                </TableCell>

                {/* Последняя сделка */}
                <TableCell className="w-[100px] text-right text-sm text-muted-foreground">
                    {latestDeal ? new Date(latestDeal.to).toLocaleDateString('ru-RU') : '—'}
                </TableCell>
            </TableRow>

            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={6} className="p-0">
                        <Card className="m-2">
                            <CardContent className="p-4">
                                <div className="mb-3">
                                    <h4 className="font-medium text-sm mb-2">Детализация сделок</h4>
                                    <DealsDetailExpanded deals={deals} />
                                </div>
                            </CardContent>
                        </Card>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

export const DealsReportCompact = () => {
    const { deals: companies, isLoading, error } = useDealsReport();
    const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());

    const toggleCompany = (companyId: number) => {
        const newExpanded = new Set(expandedCompanies);
        if (newExpanded.has(companyId)) {
            newExpanded.delete(companyId);
        } else {
            newExpanded.add(companyId);
        }
        setExpandedCompanies(newExpanded);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-destructive">Ошибка: {error}</div>
            </div>
        );
    }

    if (!companies || companies.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Нет данных для отображения</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Отчет по сделкам (Компактный)</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{companies.length} компаний</Badge>
                    <Badge variant="secondary">
                        {expandedCompanies.size} развернуто
                    </Badge>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Компания</TableHead>
                            <TableHead className="w-[180px]">Сделки</TableHead>
                            <TableHead className="w-[120px]">Динамика</TableHead>
                            <TableHead className="w-[100px] text-right">Общий рост</TableHead>
                            <TableHead className="w-[80px] text-center">Ср. период</TableHead>
                            <TableHead className="w-[100px] text-right">Последняя</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((companyData: OrkReportDealsByCompaniesDto) => (
                            <CompanyRowCompact
                                key={companyData.company.id}
                                companyData={companyData}
                                isExpanded={expandedCompanies.has(companyData.company.id)}
                                onToggle={() => toggleCompany(companyData.company.id)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="text-sm text-muted-foreground text-center">
                Нажмите на строку для детализации • Микро-диаграмма показывает динамику сумм сделок
            </div>
        </div>
    );
}
