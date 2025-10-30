import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import { PeriodFilter } from '../../TimeLineTable/model/types';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import {
    calculateYearlyMatrix,
    getYearsInPeriod,
    getMonthlyLabels,
    filterDealsByUsers,
    calculateMonthlyPayments
} from '../../TimeLineTable/lib/utils/timeline.utils';

Chart.register(...registerables);

interface TotalChartsProps {
    companies: OrkReportDealsByCompaniesDto[];
    periodFilter: PeriodFilter;
}

export const TotalCharts: React.FC<TotalChartsProps> = ({
    companies,
    periodFilter
}) => {
    const years = getYearsInPeriod(new Date(periodFilter.startDate), new Date(periodFilter.endDate));
    const monthlyLabels = getMonthlyLabels();

    // Объединяем все сделки из всех компаний
    const allDeals = useMemo(() => {
        return companies.flatMap(company => {
            let deals = company.deals;
            if (periodFilter.assignedUsers.length > 0) {
                deals = filterDealsByUsers(deals, periodFilter.assignedUsers);
            }
            return deals;
        });
    }, [companies, periodFilter.assignedUsers]);

    // Создаем виртуальную компанию
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

    // Рассчитываем матрицу по годам
    const yearlyMatrix = useMemo(() => {
        return calculateYearlyMatrix(
            totalCompanyData,
            new Date(periodFilter.startDate),
            new Date(periodFilter.endDate),
            periodFilter.assignedUsers
        );
    }, [totalCompanyData, periodFilter.startDate, periodFilter.endDate, periodFilter.assignedUsers]);

    // График годовой реализации по месяцам
    const monthlyRevenueData = useMemo(() => {
        const datasets = years.map((year, yearIndex) => {
            const yearData = yearlyMatrix.find(yd => yd.year === year);
            const data = monthlyLabels.map((_, monthIndex) =>
                yearData?.monthlyTotals[monthIndex] || 0
            );

            return {
                label: `${year}`,
                data,
                borderColor: `hsl(${(yearIndex * 60) % 360}, 70%, 50%)`,
                backgroundColor: `hsla(${(yearIndex * 60) % 360}, 70%, 50%, 0.1)`,
                tension: 0.4
            };
        });

        return {
            labels: monthlyLabels,
            datasets
        };
    }, [yearlyMatrix, years, monthlyLabels]);

    // График итоговой реализации по годам
    const yearlyTotalData = useMemo(() => {
        const labels = years.map(year => year.toString());
        const data = yearlyMatrix.map(yearData =>
            yearData.monthlyTotals.reduce((sum, val) => sum + val, 0)
        );

        return {
            labels,
            datasets: [{
                label: 'Общая реализация за год',
                data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }, [yearlyMatrix, years]);

    // График месячной реализации (сумма по всем годам)
    const monthlyTotalData = useMemo(() => {
        const labels = monthlyLabels;
        const data = monthlyLabels.map((_, monthIndex) => {
            return yearlyMatrix.reduce((sum, yearData) =>
                sum + (yearData.monthlyTotals[monthIndex] || 0), 0
            );
        });

        return {
            labels,
            datasets: [{
                label: 'Суммарная реализация по месяцам',
                data,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }, [yearlyMatrix, monthlyLabels]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const value = context.parsed.y || 0;
                        return `${context.dataset.label}: ${Math.round(value).toLocaleString('ru-RU')} ₽`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return Math.round(value).toLocaleString('ru-RU') + ' ₽';
                    }
                }
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* График годовой реализации по месяцам */}
            <Card>
                <CardHeader>
                    <CardTitle>Месячная реализация по годам</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ height: '300px' }}>
                        <Line data={monthlyRevenueData} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>

            {/* График итоговой реализации по годам */}
            <Card>
                <CardHeader>
                    <CardTitle>Общая реализация по годам</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ height: '300px' }}>
                        <Line data={yearlyTotalData} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>

            {/* График месячной реализации (сумма по всем годам) */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Суммарная реализация по месяцам (все годы)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ height: '300px' }}>
                        <Line data={monthlyTotalData} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

