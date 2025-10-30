'use client'

import { useMemo } from 'react';
import { OrkReportDealItemDto, OrkReportDealsByCompaniesDto } from "@workspace/nest-api";
import { useDealsReport } from "../hooks/deals-report.hook";
import { getDealDuration } from "../lib/calculation.util";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ImplementationAnalytics } from "./ImplementationAnalytics";
import { MonthlyRevenueChart as MonthlyRevenueChartRefactored } from "../../../feature/deals-report-calculation/TimeLineTable";
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
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
} from 'recharts';


// 2. Нагрузка сумм по компаниям (топ-10)
const CompanyLoadChart = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    const companyData = useMemo(() => {
        return companies
            .map(company => ({
                name: company.company.title.length > 20
                    ? company.company.title.substring(0, 20) + '...'
                    : company.company.title,
                fullName: company.company.title,
                revenue: company.deals.reduce((sum, deal) => sum + +deal.sum, 0),
                deals: company.deals.length,
                avgDeal: company.deals.reduce((sum, deal) => sum + +deal.sum, 0) / company.deals.length
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }, [companies]);

    const chartConfig = {
        revenue: {
            label: "Выручка",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Топ-10 компаний по выручке</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart data={companyData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <ChartTooltip
                            content={<ChartTooltipContent
                                formatter={(value, name, item) => [
                                    `${(+value).toLocaleString('ru-RU')} ₽`,
                                    name
                                ]}
                            />}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

// 3. Компании по росту/падению
const GrowthAnalysisChart = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    const growthData = useMemo(() => {
        const categories = {
            growing: { name: "Растущие", count: 0, revenue: 0, color: "#22c55e" },
            stable: { name: "Стабильные", count: 0, revenue: 0, color: "#f59e0b" },
            declining: { name: "Падающие", count: 0, revenue: 0, color: "#ef4444" }
        };

        companies.forEach(companyData => {
            const sortedDeals = [...companyData.deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
            const firstDeal = sortedDeals[0];
            const lastDeal = sortedDeals[sortedDeals.length - 1];

            if (firstDeal && lastDeal && firstDeal !== lastDeal) {
                const growth = ((+lastDeal.sum - +firstDeal.sum) / +firstDeal.sum) * 100;
                const totalRevenue = companyData.deals.reduce((sum, deal) => sum + +deal.sum, 0);

                if (growth > 10) {
                    categories.growing.count++;
                    categories.growing.revenue += totalRevenue;
                } else if (growth < -10) {
                    categories.declining.count++;
                    categories.declining.revenue += totalRevenue;
                } else {
                    categories.stable.count++;
                    categories.stable.revenue += totalRevenue;
                }
            } else {
                categories.stable.count++;
                categories.stable.revenue += companyData.deals.reduce((sum, deal) => sum + +deal.sum, 0);
            }
        });

        return Object.values(categories);
    }, [companies]);

    const chartConfig = {
        growing: { label: "Растущие", color: "#22c55e" },
        stable: { label: "Стабильные", color: "#f59e0b" },
        declining: { label: "Падающие", color: "#ef4444" },
    } satisfies ChartConfig;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Распределение компаний по росту</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <PieChart>
                            <Pie
                                data={growthData}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {growthData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Выручка по категориям роста</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <BarChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip
                                content={<ChartTooltipContent
                                    formatter={(value) => [`${(+value).toLocaleString('ru-RU')} ₽`, "Выручка"]}
                                />}
                            />
                            <Bar dataKey="revenue" fill="var(--color-growing)" />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
};

// 4. Дополнительные аналитики
const AdditionalAnalytics = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    const analyticsData = useMemo(() => {
        const totalRevenue = companies.reduce((sum, company) =>
            sum + company.deals.reduce((dealSum, deal) => dealSum + +deal.sum, 0), 0
        );
        const totalDeals = companies.reduce((sum, company) => sum + company.deals.length, 0);
        const avgDealValue = totalRevenue / totalDeals;

        const durationStats = companies.flatMap(company =>
            company.deals.map(deal => getDealDuration(deal))
        );
        const avgDuration = durationStats.reduce((sum, duration) => sum + duration, 0) / durationStats.length;

        const activeCompanies = companies.filter(company =>
            company.deals.some(deal => new Date(deal.to) > new Date())
        ).length;

        return {
            totalRevenue,
            totalDeals,
            avgDealValue,
            avgDuration,
            activeCompanies,
            totalCompanies: companies.length
        };
    }, [companies]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                        {analyticsData.totalCompanies}
                    </div>
                    <div className="text-xs text-muted-foreground">Компаний</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {analyticsData.activeCompanies}
                    </div>
                    <div className="text-xs text-muted-foreground">Активных</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                        {analyticsData.totalDeals}
                    </div>
                    <div className="text-xs text-muted-foreground">Сделок</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {analyticsData.totalRevenue.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-muted-foreground">Общая выручка</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {analyticsData.avgDealValue.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-muted-foreground">Средняя сделка</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {analyticsData.avgDuration.toFixed(1)}м
                    </div>
                    <div className="text-xs text-muted-foreground">Средний период</div>
                </CardContent>
            </Card>
        </div>
    );
};

// 5. Тренд по периодам сделок
const DealDurationTrendChart = ({ companies }: { companies: OrkReportDealsByCompaniesDto[] }) => {
    const durationData = useMemo(() => {
        const durationMap = new Map<number, number>();

        companies.forEach(companyData => {
            companyData.deals.forEach(deal => {
                const duration = getDealDuration(deal);
                durationMap.set(duration, (durationMap.get(duration) || 0) + 1);
            });
        });

        return Array.from(durationMap.entries())
            .map(([duration, count]) => ({
                duration: `${duration} мес.`,
                count,
                percentage: (count / Array.from(durationMap.values()).reduce((sum, c) => sum + c, 0)) * 100
            }))
            .sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    }, [companies]);

    const chartConfig = {
        count: {
            label: "Количество сделок",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Распределение сделок по периодам</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart data={durationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="duration" />
                        <YAxis />
                        <ChartTooltip
                            content={<ChartTooltipContent
                                formatter={(value, name, item) => [
                                    `${value} сделок (${item.payload.percentage.toFixed(1)}%)`,
                                    name
                                ]}
                            />}
                        />
                        <Bar dataKey="count" fill="var(--color-count)" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export const DealsAnalytics = () => {
    const { deals: companies, isLoading, error } = useDealsReport();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Загрузка аналитики...</div>
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
                <div className="text-muted-foreground">Нет данных для аналитики</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Аналитика по сделкам</h1>
                <Badge variant="outline">{companies.length} компаний</Badge>
            </div>

            {/* Ключевые метрики */}
            <AdditionalAnalytics companies={companies} />

            {/* Анализ динамики реализации */}
            <ImplementationAnalytics companies={companies} />

            {/* Основные графики */}
            <div className="grid gap-6">
                {/* <MonthlyRevenueChartRefactored companies={companies} /> */}
                <CompanyLoadChart companies={companies} />
                <GrowthAnalysisChart companies={companies} />
                <DealDurationTrendChart companies={companies} />
            </div>
        </div>
    );
}
