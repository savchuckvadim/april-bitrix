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

// Компонент для отображения детализации сделок в выпадающем списке
const DealsDetail = ({ deals }: { deals: OrkReportDealItemDto[] }) => {
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
                    <div key={deal.id} className="flex items-center justify-between py-2 px-3 bg-background rounded border">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                            </div>
                            <div>
                                <div className="font-medium text-sm">{deal.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {fromDate.toLocaleDateString('ru-RU')} - {toDate.toLocaleDateString('ru-RU')} ({duration} мес.)
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="font-semibold text-sm">
                                {(+deal.sum).toLocaleString('ru-RU')} ₽
                            </div>
                            {growth !== null && (
                                <Badge
                                    variant={growth > 0 ? "default" : "destructive"}
                                    className="text-xs"
                                >
                                    {growth > 0 ? '↗' : '↘'} {Math.abs(growth).toFixed(1)}%
                                </Badge>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Компонент строки таблицы с выпадающей детализацией
const CompanyRow = ({ companyData, isExpanded, onToggle }: {
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

    const avgDealSum = totalSum / deals.length;
    const totalDuration = deals.reduce((sum, deal) => sum + getDealDuration(deal), 0);
    const avgDuration = totalDuration / deals.length;

    // Последняя сделка
    const latestDeal = lastDeal;
    const latestDealGrowth = sortedDeals.length > 1
        ? (() => {
            const prevDeal = sortedDeals[sortedDeals.length - 2];
            return prevDeal && latestDeal ? (((+latestDeal?.sum  - +prevDeal.sum) / +prevDeal.sum) * 100) : null;
        })()
        : null;

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={onToggle}
            >
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                        >
                            {isExpanded ? '▼' : '▶'}
                        </Button>
                        <div>
                            <div className="font-medium">{company.title}</div>
                            <div className="text-xs text-muted-foreground">
                                ARM ID: {company.armInfo || 'не установлено'}
                            </div>
                        </div>
                    </div>
                </TableCell>

                <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">
                        {deals.length}
                    </Badge>
                </TableCell>

                <TableCell className="text-right font-medium">
                    {totalSum.toLocaleString('ru-RU')} ₽
                </TableCell>

                <TableCell className="text-right">
                    <div className="text-sm font-medium">
                        {avgDealSum.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-muted-foreground">
                        средняя
                    </div>
                </TableCell>

                <TableCell className="text-center">
                    <div className="text-sm font-medium">
                        {avgDuration.toFixed(1)} мес.
                    </div>
                    <div className="text-xs text-muted-foreground">
                        средняя
                    </div>
                </TableCell>

                <TableCell className="text-right">
                    {totalGrowth !== null ? (
                        <div className="flex items-center justify-end gap-1">
                            <Badge
                                variant={totalGrowth > 0 ? "default" : "destructive"}
                                className="text-xs"
                            >
                                {totalGrowth > 0 ? '↗' : '↘'} {Math.abs(totalGrowth).toFixed(1)}%
                            </Badge>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                    )}
                </TableCell>

                <TableCell className="text-right">
                    {latestDealGrowth !== null ? (
                        <div className="flex items-center justify-end gap-1">
                            <Badge
                                variant={latestDealGrowth > 0 ? "default" : "destructive"}
                                className="text-xs"
                            >
                                {latestDealGrowth > 0 ? '↗' : '↘'} {Math.abs(latestDealGrowth).toFixed(1)}%
                            </Badge>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                    )}
                </TableCell>

                <TableCell className="text-right text-sm text-muted-foreground">
                    {latestDeal ? new Date(latestDeal.to).toLocaleDateString('ru-RU') : '—'}
                </TableCell>
            </TableRow>

            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={8} className="p-0">
                        <Card className="m-2">
                            <CardContent className="p-4">
                                <div className="mb-3">
                                    <h4 className="font-medium text-sm mb-2">Детализация сделок</h4>
                                    <DealsDetail deals={deals} />
                                </div>
                            </CardContent>
                        </Card>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

export const DealsReportTable = () => {
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
                <h1 className="text-2xl font-bold">Отчет по сделкам компаний (Таблица)</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{companies.length} компаний</Badge>
                    <Badge variant="secondary">
                        {expandedCompanies.size} развернуто
                    </Badge>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Компания</TableHead>
                            <TableHead className="w-[80px] text-center">Сделок</TableHead>
                            <TableHead className="w-[120px] text-right">Общая сумма</TableHead>
                            <TableHead className="w-[120px] text-right">Средняя сумма</TableHead>
                            <TableHead className="w-[100px] text-center">Средний период</TableHead>
                            <TableHead className="w-[120px] text-right">Общий рост</TableHead>
                            <TableHead className="w-[120px] text-right">Последний рост</TableHead>
                            <TableHead className="w-[100px] text-right">Последняя сделка</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((companyData: OrkReportDealsByCompaniesDto) => (
                            <CompanyRow
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
                Нажмите на строку компании для просмотра детализации сделок
            </div>
        </div>
    );
}
