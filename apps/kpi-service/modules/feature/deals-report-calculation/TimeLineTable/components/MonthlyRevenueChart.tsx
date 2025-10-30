import React, { useMemo, useState } from 'react';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
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
} from 'recharts';
import { getMinDateFromDeals } from '../lib/utils/timeline.utils';
import { getDealDuration } from '../../../../entities/deals-report/lib/calculation.util';

interface MonthlyRevenueChartProps {
    companies: OrkReportDealsByCompaniesDto[];
}

interface MonthlyData {
    month: string;
    revenue: number;
    deals: number;
    avgPrice: number;
    priceIndex: number;
}

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ companies }) => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Получаем доступные годы
    const availableYears = useMemo(() => {
        if (companies.length === 0) return [new Date().getFullYear()];

        const minDate = getMinDateFromDeals(companies);
        const currentYear = new Date().getFullYear();
        const minYear = minDate.getFullYear();

        const years = [];
        for (let year = minYear; year <= currentYear + 2; year++) {
            years.push(year);
        }
        return years;
    }, [companies]);

    // Рассчитываем ежемесячные данные с учетом duration и monthSum
    const monthlyData = useMemo(() => {
        const monthlyMap = new Map<string, MonthlyData>();

        companies.forEach(companyData => {
            companyData.deals.forEach(deal => {
                const dealFrom = new Date(deal.from);
                const dealTo = new Date(deal.to);
                const dealYear = dealFrom.getFullYear();

                // Фильтруем сделки по выбранному году
                if (dealYear !== selectedYear) return;

                // Рассчитываем ежемесячные платежи
                const totalSum = +deal.sum;
                const duration = deal.duration || getDealDuration(deal);
                const monthlyAmount = deal.monthSum || (totalSum / duration);

                // Рассчитываем платежи на основе реальной длительности сделки
                const actualDuration = Math.ceil((dealTo.getTime() - dealFrom.getTime()) / (1000 * 60 * 60 * 24 * 30));
                const actualDurationMonths = Math.max(1, actualDuration);

                for (let i = 0; i < actualDurationMonths; i++) {
                    const paymentDate = new Date(dealFrom);
                    paymentDate.setMonth(paymentDate.getMonth() + i);

                    // Проверяем, что платеж не выходит за рамки сделки
                    if (paymentDate <= dealTo) {
                        const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
                        const monthName = paymentDate.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });

                        if (!monthlyMap.has(monthKey)) {
                            monthlyMap.set(monthKey, {
                                month: monthName,
                                revenue: 0,
                                deals: 0,
                                avgPrice: 0,
                                priceIndex: 0
                            });
                        }

                        const monthData = monthlyMap.get(monthKey)!;
                        monthData.revenue += monthlyAmount;
                        monthData.deals += 1;
                    }
                }
            });
        });

        // Рассчитываем средние цены и индексацию
        const sortedMonths = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
        let prevAvgPrice = 0;

        return sortedMonths.map((month, index) => {
            month.avgPrice = month.deals > 0 ? month.revenue / month.deals : 0;
            month.priceIndex = prevAvgPrice > 0 ? ((month.avgPrice - prevAvgPrice) / prevAvgPrice) * 100 : 0;
            prevAvgPrice = month.avgPrice;
            return month;
        });
    }, [companies, selectedYear]);

    const chartConfig = {
        revenue: {
            label: "Выручка",
            color: "hsl(var(--chart-1))",
        },
        deals: {
            label: "Количество сделок",
            color: "hsl(var(--chart-2))",
        },
        priceIndex: {
            label: "Индексация цен (%)",
            color: "hsl(var(--chart-3))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Динамика выручки и индексации по месяцам</CardTitle>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Год:</label>
                        <Select
                            value={selectedYear.toString()}
                            onValueChange={(value) => setSelectedYear(+value)}
                        >
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {monthlyData.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Нет данных за выбранный год
                    </div>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" name="Выручка (₽)" />
                            <Bar yAxisId="left" dataKey="deals" fill="var(--color-deals)" name="Сделки (шт)" />
                            <Line yAxisId="right" type="monotone" dataKey="priceIndex" stroke="var(--color-priceIndex)" name="Индексация (%)" />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};
