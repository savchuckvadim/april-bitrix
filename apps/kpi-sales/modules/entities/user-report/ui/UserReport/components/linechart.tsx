import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { OrkReportDealsByCompaniesDto } from "@workspace/nest-api";

Chart.register(...registerables);

interface LineChartProps {
    companies: OrkReportDealsByCompaniesDto[];
    chartType?: 'avgSum' | 'index' | 'realization' | 'combined';
}

interface MonthlyData {
    month: string;
    totalSum: number;
    dealCount: number;
    totalIndex: number;
    indexCount: number;
    successfulDeals: number;
    realizationRevenue: number;
    avgSum: number;
    avgIndex: number;
}

const LineChart: React.FC<LineChartProps> = ({ companies, chartType = 'avgSum' }) => {
    // Подготавливаем данные в зависимости от типа графика
    const chartData = useMemo((): MonthlyData[] => {
        if (!companies || companies.length === 0) {
            return [];
        }

        const monthlyMap = new Map<string, MonthlyData>();

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
                        totalIndex: 0,
                        indexCount: 0,
                        successfulDeals: 0,
                        realizationRevenue: 0,
                        avgSum: 0,
                        avgIndex: 0
                    });
                }

                const monthData = monthlyMap.get(monthKey)!;
                monthData.totalSum += +deal.sum;
                monthData.dealCount += 1;

                // Определяем успешность сделки и добавляем выручку
                const isSuccessful = deal.isWon || deal.isInProgress;
                if (isSuccessful) {
                    monthData.successfulDeals += 1;
                    monthData.realizationRevenue += +deal.sum;
                }
            });
        });

        // Рассчитываем индексацию для каждой компании
        companies.forEach(companyData => {
            const sortedDeals = [...companyData.deals].sort((a, b) =>
                new Date(a.from).getTime() - new Date(b.from).getTime()
            );

            sortedDeals.forEach((deal, index) => {
                if (index > 0) {
                    const prevDeal = sortedDeals[index - 1];
                    if (prevDeal) {
                        const dealDate = new Date(deal.from);
                        const monthKey = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`;

                        if (monthlyMap.has(monthKey)) {
                            const monthData = monthlyMap.get(monthKey)!;
                            const currentSum = +deal.sum;
                            const prevSum = +prevDeal.sum;
                            const indexChange = prevSum > 0 ? ((currentSum - prevSum) / prevSum) * 100 : 0;
                            monthData.totalIndex += indexChange;
                            monthData.indexCount += 1;
                        }
                    }
                }
            });
        });

        return Array.from(monthlyMap.values())
            .map(month => ({
                ...month,
                avgSum: month.totalSum / month.dealCount,
                avgIndex: month.indexCount > 0 ? month.totalIndex / month.indexCount : 0,
                realizationRevenue: month.realizationRevenue
            }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }, [companies]);

    // Настройки для разных типов графиков
    const getChartConfig = () => {
        switch (chartType) {
            case 'avgSum':
                return {
                    labels: chartData.map(item => item.month),
                    datasets: [
                        {
                            label: 'Средняя сумма сделки (₽)',
                            data: chartData.map(item => item.avgSum),
                            fill: true,
                            lineTension: 0.4,
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderColor: 'rgb(59, 130, 246)',
                            borderCapStyle: 'butt' as const,
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter' as const,
                            pointBorderColor: 'rgb(59, 130, 246)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgb(59, 130, 246)',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 2,
                            pointRadius: 4,
                            pointHitRadius: 10,
                        }
                    ]
                };

            case 'index':
                return {
                    labels: chartData.map(item => item.month),
                    datasets: [
                        {
                            label: 'Средняя индексация (%)',
                            data: chartData.map(item => item.avgIndex),
                            fill: true,
                            lineTension: 0.4,
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            borderColor: 'rgb(34, 197, 94)',
                            borderCapStyle: 'butt' as const,
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter' as const,
                            pointBorderColor: 'rgb(34, 197, 94)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgb(34, 197, 94)',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 2,
                            pointRadius: 4,
                            pointHitRadius: 10,
                        }
                    ]
                };

            case 'realization':
                return {
                    labels: chartData.map(item => item.month),
                    datasets: [
                        {
                            label: 'Выручка от реализации (₽)',
                            data: chartData.map(item => item.realizationRevenue),
                            fill: true,
                            lineTension: 0.4,
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            borderColor: 'rgb(168, 85, 247)',
                            borderCapStyle: 'butt' as const,
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter' as const,
                            pointBorderColor: 'rgb(168, 85, 247)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgb(168, 85, 247)',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 2,
                            pointRadius: 4,
                            pointHitRadius: 10,
                        }
                    ]
                };

            case 'combined':
                return {
                    labels: chartData.map(item => item.month),
                    datasets: [
                        {
                            label: 'Средняя сумма (₽)',
                            data: chartData.map(item => item.avgSum),
                            fill: false,
                            lineTension: 0.4,
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderColor: 'rgb(59, 130, 246)',
                            pointBorderColor: 'rgb(59, 130, 246)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgb(59, 130, 246)',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 2,
                            pointRadius: 4,
                            pointHitRadius: 10,
                        },
                        {
                            label: 'Индексация (%)',
                            data: chartData.map(item => item.avgIndex),
                            fill: false,
                            lineTension: 0.4,
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            borderColor: 'rgb(34, 197, 94)',
                            pointBorderColor: 'rgb(34, 197, 94)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgb(34, 197, 94)',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 2,
                            pointRadius: 4,
                            pointHitRadius: 10,
                        },
                        {
                            label: 'Выручка от реализации (₽)',
                            data: chartData.map(item => item.realizationRevenue),
                            fill: false,
                            lineTension: 0.4,
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            borderColor: 'rgb(168, 85, 247)',
                            pointBorderColor: 'rgb(168, 85, 247)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgb(168, 85, 247)',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 2,
                            pointRadius: 4,
                            pointHitRadius: 10,
                        }
                    ]
                };

            default:
                return { labels: [], datasets: [] };
        }
    };

    const getTitle = (): string => {
        switch (chartType) {
            case 'avgSum': return 'Динамика средней суммы сделок';
            case 'index': return 'Динамика индексации';
            case 'realization': return 'Динамика выручки от реализации';
            case 'combined': return 'Комбинированный анализ';
            default: return 'Линейный график';
        }
    };

    const getOptions = () => {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;

                            if (label.includes('сумма') || label.includes('Средняя сумма') || label.includes('реализации')) {
                                return `${label}: ${value.toLocaleString('ru-RU')} ₽`;
                            } else if (label.includes('%') || label.includes('индексация')) {
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Период'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: chartType === 'avgSum' || chartType === 'realization' ? 'Сумма (₽)' : 'Процент (%)'
                    },
                    ticks: {
                        callback: function (value: any) {
                            if (chartType === 'avgSum' || chartType === 'realization') {
                                return value.toLocaleString('ru-RU') + ' ₽';
                            } else {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        };

        // Специальные настройки для комбинированного графика
        if (chartType === 'combined') {
            baseOptions.scales.y = {
                display: true,
                title: {
                    display: true,
                    text: 'Значения'
                },
                ticks: {
                    callback: function (value: any) {
                        // Определяем, какая линия активна, и форматируем соответственно
                        return value;
                    }
                }
            };
        }

        return baseOptions;
    };

    if (!companies || companies.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{getTitle()}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-muted-foreground">Нет данных для отображения</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{getTitle()}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: '400px', width: '100%' }}>
                    <Line
                        data={getChartConfig()}
                        options={getOptions()}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default LineChart;
