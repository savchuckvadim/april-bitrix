'use client'

import { useMemo } from 'react';
import { OrkReportDealsByCompaniesDto } from "@workspace/nest-api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ImplementationLineCharts } from "./charts/ImplementationLineCharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@workspace/ui/components/chart";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
} from 'recharts';

// Типы для анализа реализации
interface ImplementationIndex {
    companyId: string;
    companyName: string;
    deals: Array<{
        date: string;
        sum: number;
        index: number; // процент изменения от предыдущей сделки
        realization: number; // 1 для успешных, 0 для отказов
    }>;
    avgIndex: number;
    realizationRate: number; // процент успешных сделок
}

interface MonthlyIndexData {
    month: string;
    avgIndex: number;
    totalDeals: number;
    successfulDeals: number;
    realizationRevenue: number; // выручка от успешных сделок в рублях
    avgDealSum: number;
}

interface CompanyHeatmapData {
    company: string;
    periods: Array<{
        period: string;
        index: number;
        realization: number; // выручка от успешных сделок в рублях
        deals: number;
    }>;
}

// 1. Линейный график изменения средней суммы сделок во времени
const AverageDealSumTrendChart = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    const trendData = useMemo(() => {
        const monthlyMap = new Map<string, { month: string; totalSum: number; dealCount: number; avgSum: number }>();

        companies.forEach(companyData => {
            companyData.deals.forEach(deal => {
                const dealDate = new Date(deal.from);
                const monthKey = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`;
                const monthName = dealDate.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });

                if (!monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, {
                        month: monthName,
                        totalSum: 0,
                        dealCount: 0,
                        avgSum: 0
                    });
                }

                const monthData = monthlyMap.get(monthKey)!;
                monthData.totalSum += +deal.sum;
                monthData.dealCount += 1;
            });
        });

        return Array.from(monthlyMap.values())
            .map(month => ({
                ...month,
                avgSum: month.totalSum / month.dealCount
            }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }, [companies]);

    const chartConfig = {
        avgSum: {
            label: "Средняя сумма сделки",
            color: "hsl(var(--chart-1))",
        },
        dealCount: {
            label: "Количество сделок",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Динамика средней суммы сделок</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip
                            content={<ChartTooltipContent
                                formatter={(value, name) => [
                                    name === 'avgSum' ? `${(+value).toLocaleString('ru-RU')} ₽` : value,
                                    name === 'avgSum' ? 'Средняя сумма' : 'Количество сделок'
                                ]}
                            />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="avgSum"
                            stroke="var(--color-avgSum)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--color-avgSum)', strokeWidth: 2, r: 4 }}
                        />
                        <Bar yAxisId="right" dataKey="dealCount" fill="var(--color-dealCount)" opacity={0.3} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

// 2. Столбчатая диаграмма средней индексации по месяцам
const MonthlyIndexChart = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    const indexData = useMemo(() => {
        const monthlyMap = new Map<string, MonthlyIndexData>();

        companies.forEach(companyData => {
            // Сортируем сделки по дате для расчета индексации
            const sortedDeals = [...companyData.deals].sort((a, b) =>
                new Date(a.from).getTime() - new Date(b.from).getTime()
            );

            sortedDeals.forEach((deal, index) => {
                const dealDate = new Date(deal.from);
                const monthKey = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`;
                const monthName = dealDate.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });

                if (!monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, {
                        month: monthName,
                        avgIndex: 0,
                        totalDeals: 0,
                        successfulDeals: 0,
                        realizationRevenue: 0,
                        avgDealSum: 0
                    });
                }

                const monthData = monthlyMap.get(monthKey)!;
                monthData.totalDeals += 1;
                monthData.avgDealSum += +deal.sum;

                // Определяем успешность сделки и добавляем выручку
                const isSuccessful = deal.isWon || deal.isInProgress;
                if (isSuccessful) {
                    monthData.successfulDeals += 1;
                    monthData.realizationRevenue += +deal.sum;
                }

                // Рассчитываем индексацию (изменение от предыдущей сделки)
                if (index > 0) {
                    const prevDeal = sortedDeals[index - 1];
                    if (prevDeal) {
                        const currentSum = +deal.sum;
                        const prevSum = +prevDeal.sum;
                        const indexChange = prevSum > 0 ? ((currentSum - prevSum) / prevSum) * 100 : 0;
                        monthData.avgIndex += indexChange;
                    }
                }
            });
        });

        return Array.from(monthlyMap.values())
            .map(month => ({
                ...month,
                avgIndex: month.totalDeals > 0 ? month.avgIndex / month.totalDeals : 0,
                avgDealSum: month.totalDeals > 0 ? month.avgDealSum / month.totalDeals : 0
            }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }, [companies]);

    const chartConfig = {
        avgIndex: {
            label: "Средняя индексация (%)",
            color: "hsl(var(--chart-1))",
        },
        realizationRevenue: {
            label: "Выручка от реализации (₽)",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Индексация и выручка от реализации по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart data={indexData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip
                            content={<ChartTooltipContent
                                formatter={(value, name) => [
                                    name === 'avgIndex' ? `${(+value).toFixed(1)}%` : `${(+value).toLocaleString('ru-RU')} ₽`,
                                    name === 'avgIndex' ? 'Индексация' : 'Выручка от реализации'
                                ]}
                            />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar yAxisId="left" dataKey="avgIndex" fill="var(--color-avgIndex)" name="Индексация (%)" />
                        <Bar yAxisId="right" dataKey="realizationRevenue" fill="var(--color-realizationRevenue)" name="Выручка от реализации (₽)" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

// 3. Тепловая карта реализации по компаниям и периодам
const CompanyRealizationHeatmap = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    const heatmapData = useMemo(() => {
        const companyMap = new Map<string, CompanyHeatmapData>();
        const periods = new Set<string>();

        // Собираем все периоды
        companies.forEach(companyData => {
            companyData.deals.forEach(deal => {
                const dealDate = new Date(deal.from);
                const period = `${dealDate.getFullYear()}-Q${Math.ceil((dealDate.getMonth() + 1) / 3)}`;
                periods.add(period);
            });
        });

        const sortedPeriods = Array.from(periods).sort();

        companies.forEach(companyData => {
            const companyName = companyData.company.title.length > 15
                ? companyData.company.title.substring(0, 15) + '...'
                : companyData.company.title;

            const companyHeatmapData: CompanyHeatmapData = {
                company: companyName,
                periods: sortedPeriods.map(period => ({
                    period,
                    index: 0,
                    realization: 0,
                    deals: 0
                }))
            };

            // Группируем сделки по кварталам
            const quarterlyDeals = new Map<string, typeof companyData.deals>();
            companyData.deals.forEach(deal => {
                const dealDate = new Date(deal.from);
                const period = `${dealDate.getFullYear()}-Q${Math.ceil((dealDate.getMonth() + 1) / 3)}`;

                if (!quarterlyDeals.has(period)) {
                    quarterlyDeals.set(period, []);
                }
                quarterlyDeals.get(period)!.push(deal);
            });

            // Рассчитываем индексацию и реализацию для каждого периода
            quarterlyDeals.forEach((deals, period) => {
                const sortedDeals = deals.sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
                const periodIndex = sortedPeriods.indexOf(period);

                if (periodIndex >= 0) {
                    const periodData = companyHeatmapData.periods[periodIndex];
                    if (periodData) {
                        periodData.deals = deals.length;

                        // Рассчитываем среднюю индексацию
                        let totalIndex = 0;
                        let indexCount = 0;

                        sortedDeals.forEach((deal, index) => {
                            if (index > 0) {
                                const prevDeal = sortedDeals[index - 1];
                                if (prevDeal) {
                                    const currentSum = +deal.sum;
                                    const prevSum = +prevDeal.sum;
                                    const indexChange = prevSum > 0 ? ((currentSum - prevSum) / prevSum) * 100 : 0;
                                    totalIndex += indexChange;
                                    indexCount++;
                                }
                            }
                        });

                        periodData.index = indexCount > 0 ? totalIndex / indexCount : 0;

                        // Рассчитываем выручку от реализации
                        const successfulDeals = deals.filter(deal => deal.isWon || deal.isInProgress);
                        periodData.realization = successfulDeals.reduce((sum, deal) => sum + +deal.sum, 0);
                    }
                }
            });

            companyMap.set(companyData.company.id.toString(), companyHeatmapData);
        });

        return Array.from(companyMap.values()).slice(0, 10); // Топ-10 компаний
    }, [companies]);

    const getHeatmapColor = (value: number, type: 'index' | 'realization') => {
        if (type === 'index') {
            if (value > 10) return '#22c55e'; // Зеленый для роста
            if (value < -10) return '#ef4444'; // Красный для падения
            return '#f59e0b'; // Желтый для стабильности
        } else {
            // Для выручки от реализации (в рублях)
            if (value > 1000000) return '#22c55e'; // Зеленый для высокой выручки (>1М)
            if (value > 500000) return '#f59e0b'; // Желтый для средней выручки (500К-1М)
            return '#ef4444'; // Красный для низкой выручки (<500К)
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Индексация по компаниям (кварталы)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {heatmapData.map((company) => (
                            <div key={company.company} className="flex items-center space-x-2">
                                <div className="w-32 text-sm truncate">{company.company}</div>
                                <div className="flex space-x-1">
                                    {company.periods.map((period) => (
                                        <div
                                            key={period.period}
                                            className="w-8 h-6 rounded text-xs flex items-center justify-center text-white font-medium"
                                            style={{ backgroundColor: getHeatmapColor(period.index, 'index') }}
                                            title={`${period.period}: ${period.index.toFixed(1)}%`}
                                        >
                                            {period.index > 0 ? '+' : ''}{period.index.toFixed(0)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>Рост &gt;10%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span>Стабильно ±10%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-red-500 rounded"></div>
                                <span>Падение &gt;10%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Выручка от реализации по компаниям (кварталы)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {heatmapData.map((company) => (
                            <div key={company.company} className="flex items-center space-x-2">
                                <div className="w-32 text-sm truncate">{company.company}</div>
                                <div className="flex space-x-1">
                                    {company.periods.map((period) => (
                                        <div
                                            key={period.period}
                                            className="w-8 h-6 rounded text-xs flex items-center justify-center text-white font-medium"
                                            style={{ backgroundColor: getHeatmapColor(period.realization, 'realization') }}
                                            title={`${period.period}: ${period.realization.toLocaleString('ru-RU')} ₽`}
                                        >
                                            {period.realization > 1000000 ? `${(period.realization / 1000000).toFixed(1)}М` : period.realization > 1000 ? `${(period.realization / 1000).toFixed(0)}К` : period.realization.toFixed(0)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>Высокая &gt;1М ₽</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span>Средняя 500К-1М ₽</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-red-500 rounded"></div>
                                <span>Низкая &lt;500К ₽</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// 4. Сводная аналитика по индексации
const ImplementationSummary = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    const summaryData = useMemo(() => {
        let totalIndex = 0;
        let indexCount = 0;
        let totalRealizationRevenue = 0;
        let totalDeals = 0;
        let successfulDeals = 0;
        let growingCompanies = 0;
        let stableCompanies = 0;
        let decliningCompanies = 0;

        companies.forEach(companyData => {
            const sortedDeals = [...companyData.deals].sort((a, b) =>
                new Date(a.from).getTime() - new Date(b.from).getTime()
            );

            // Рассчитываем общую индексацию
            sortedDeals.forEach((deal, index) => {
                totalDeals++;
                if (deal.isWon || deal.isInProgress) {
                    successfulDeals++;
                    totalRealizationRevenue += +deal.sum;
                }

                if (index > 0) {
                    const prevDeal = sortedDeals[index - 1];
                    if (prevDeal) {
                        const currentSum = +deal.sum;
                        const prevSum = +prevDeal.sum;
                        const indexChange = prevSum > 0 ? ((currentSum - prevSum) / prevSum) * 100 : 0;
                        totalIndex += indexChange;
                        indexCount++;
                    }
                }
            });

            // Классифицируем компанию по росту
            if (sortedDeals.length > 1) {
                const firstDeal = sortedDeals[0];
                const lastDeal = sortedDeals[sortedDeals.length - 1];
                if (firstDeal && lastDeal) {
                    const growth = ((+lastDeal.sum - +firstDeal.sum) / +firstDeal.sum) * 100;

                    if (growth > 10) {
                        growingCompanies++;
                    } else if (growth < -10) {
                        decliningCompanies++;
                    } else {
                        stableCompanies++;
                    }
                }
            } else {
                stableCompanies++;
            }
        });

        return {
            avgIndex: indexCount > 0 ? totalIndex / indexCount : 0,
            totalRealizationRevenue,
            totalDeals,
            successfulDeals,
            growingCompanies,
            stableCompanies,
            decliningCompanies,
            totalCompanies: companies.length
        };
    }, [companies]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                        {summaryData.totalCompanies}
                    </div>
                    <div className="text-xs text-muted-foreground">Компаний</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {summaryData.growingCompanies}
                    </div>
                    <div className="text-xs text-muted-foreground">Растущих</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {summaryData.stableCompanies}
                    </div>
                    <div className="text-xs text-muted-foreground">Стабильных</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {summaryData.decliningCompanies}
                    </div>
                    <div className="text-xs text-muted-foreground">Падающих</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {summaryData.avgIndex.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Средняя индексация</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {summaryData.totalRealizationRevenue.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-muted-foreground">Выручка от реализации</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {summaryData.successfulDeals}/{summaryData.totalDeals}
                    </div>
                    <div className="text-xs text-muted-foreground">Успешные сделки</div>
                </CardContent>
            </Card>
        </div>
    );
};

export const ImplementationAnalytics = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    if (!companies || companies.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Нет данных для анализа реализации</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Анализ динамики реализации</h1>
                <Badge variant="outline">{companies.length} компаний</Badge>
            </div>

            {/* Сводная аналитика */}
            <ImplementationSummary companies={companies} />

            {/* Основные графики */}
            {/* <div className="grid gap-6">
                <AverageDealSumTrendChart companies={companies} />
                <MonthlyIndexChart companies={companies} />
                <CompanyRealizationHeatmap companies={companies} />
            </div> */}

            {/* Chart.js линейные графики */}
            <ImplementationLineCharts companies={companies} />
        </div>
    );
};
