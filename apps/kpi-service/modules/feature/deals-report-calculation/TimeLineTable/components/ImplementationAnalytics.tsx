import React, { useMemo } from 'react';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import { LineChart } from '../../../../shared/ui/charts/LineChart';
import { BarChart } from '../../../../shared/ui/charts/BarChart';
import { PieChart } from '../../../../shared/ui/charts/PieChart';
import { calculateMonthlyPayments, calculateTrendIndexGrowth } from '../lib/utils/timeline.utils';

// Функция для получения индекса месяца
const getMonthIndex = (monthName: string): number => {
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return months.indexOf(monthName.toLowerCase());
};

// Функция для расчета доходов по сотрудникам
const calculateUserRevenue = (companies: OrkReportDealsByCompaniesDto[], assignedUsers: string[]) => {
    const userRevenue = new Map<string, number>();

    companies.forEach(company => {
        company.deals.forEach(deal => {
            if (assignedUsers.length === 0 || assignedUsers.includes(deal.assignedById)) {
                const currentRevenue = userRevenue.get(deal.assignedById) || 0;
                userRevenue.set(deal.assignedById, currentRevenue + +deal.sum);
            }
        });
    });

    return Array.from(userRevenue.entries())
        .map(([userId, revenue]) => ({
            label: `Пользователь ${userId} (${revenue.toLocaleString('ru-RU')} ₽)`,
            value: revenue,
            color: getRandomColor()
        }))
        .sort((a, b) => b.value - a.value);
};

// Функция для расчета распределения компаний по сотрудникам
const calculateUserCompanies = (companies: OrkReportDealsByCompaniesDto[], assignedUsers: string[]) => {
    const userCompanies = new Map<string, Set<number>>();

    companies.forEach(company => {
        company.deals.forEach(deal => {
            if (assignedUsers.length === 0 || assignedUsers.includes(deal.assignedById)) {
                if (!userCompanies.has(deal.assignedById)) {
                    userCompanies.set(deal.assignedById, new Set());
                }
                userCompanies.get(deal.assignedById)?.add(company.company.id);
            }
        });
    });

    return Array.from(userCompanies.entries())
        .map(([userId, companySet]) => ({
            label: `Пользователь ${userId} (${companySet.size} компаний)`,
            value: companySet.size,
            color: getRandomColor()
        }))
        .sort((a, b) => b.value - a.value);
};

// Функция для расчета выручки по компаниям
const calculateCompanyRevenue = (companies: OrkReportDealsByCompaniesDto[], assignedUsers: string[]) => {
    return companies
        .map(company => {
            const totalRevenue = company.deals
                .filter(deal => assignedUsers.length === 0 || assignedUsers.includes(deal.assignedById))
                .reduce((sum, deal) => sum + +deal.sum, 0);

            return {
                label: company.company.title.length > 15
                    ? company.company.title.substring(0, 15) + '...'
                    : company.company.title,
                value: totalRevenue,
                color: getRandomColor()
            };
        })
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Показываем только топ-10
};

// Функция для расчета выручки по годам/месяцам
const calculateYearlyRevenue = (companies: OrkReportDealsByCompaniesDto[], assignedUsers: string[], startDate: string, endDate: string) => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const isSingleYear = startDateObj.getFullYear() === endDateObj.getFullYear();

    if (isSingleYear) {
        // Если выбран один год, показываем по месяцам
        const monthlyRevenue = new Map<string, number>();

        for (let month = 0; month < 12; month++) {
            const monthName = new Date(startDateObj.getFullYear(), month).toLocaleDateString('ru-RU', { month: 'short' });
            monthlyRevenue.set(monthName, 0);
        }

        companies.forEach(company => {
            company.deals.forEach(deal => {
                if (assignedUsers.length === 0 || assignedUsers.includes(deal.assignedById)) {
                    const dealFrom = new Date(deal.from);
                    const dealTo = new Date(deal.to);

                    if (dealFrom.getFullYear() === startDateObj.getFullYear()) {
                        const monthName = dealFrom.toLocaleDateString('ru-RU', { month: 'short' });
                        const currentRevenue = monthlyRevenue.get(monthName) || 0;
                        monthlyRevenue.set(monthName, currentRevenue + +deal.sum);
                    }
                }
            });
        });

        return Array.from(monthlyRevenue.entries())
            .map(([month, revenue]) => ({
                label: month,
                value: revenue,
                color: getRandomColor()
            }))
            .filter(item => item.value > 0);
    } else {
        // Если несколько лет, показываем по годам
        const yearlyRevenue = new Map<number, number>();

        for (let year = startDateObj.getFullYear(); year <= endDateObj.getFullYear(); year++) {
            yearlyRevenue.set(year, 0);
        }

        companies.forEach(company => {
            company.deals.forEach(deal => {
                if (assignedUsers.length === 0 || assignedUsers.includes(deal.assignedById)) {
                    const dealFrom = new Date(deal.from);
                    const dealYear = dealFrom.getFullYear();

                    if (dealYear >= startDateObj.getFullYear() && dealYear <= endDateObj.getFullYear()) {
                        const currentRevenue = yearlyRevenue.get(dealYear) || 0;
                        yearlyRevenue.set(dealYear, currentRevenue + +deal.sum);
                    }
                }
            });
        });

        return Array.from(yearlyRevenue.entries())
            .map(([year, revenue]) => ({
                label: `${year} год`,
                value: revenue,
                color: getRandomColor()
            }))
            .filter(item => item.value > 0);
    }
};

// Функция для генерации цветов (детерминированная)
let colorIndex = 0;
const getRandomColor = (): string => {
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
        '#14b8a6', '#f43f5e', '#8b5a2b', '#1e40af', '#7c3aed',
        '#dc2626', '#059669', '#7c2d12', '#be185d', '#4338ca'
    ];
    const color = colors[colorIndex % colors.length] || '#3b82f6';
    colorIndex++;
    return color;
};

interface ImplementationAnalyticsProps {
    companies: OrkReportDealsByCompaniesDto[];
    startDate: string;
    endDate: string;
    assignedUsers: string[];
}

export const ImplementationAnalytics: React.FC<ImplementationAnalyticsProps> = ({
    companies,
    startDate,
    endDate,
    assignedUsers
}) => {
    // Рассчитываем данные для графиков
    const analyticsData = useMemo(() => {
        // Сбрасываем индекс цвета для консистентности
        colorIndex = 0;
        const monthlyData = new Map<string, {
            month: string;
            totalRevenue: number;
            totalIndex: number;
            companyCount: number;
            successfulDeals: number;
            totalDeals: number;
        }>();

        // Инициализируем все месяцы в периоде
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        while (currentDate <= endDateObj) {
            const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });

            monthlyData.set(monthKey, {
                month: monthName,
                totalRevenue: 0,
                totalIndex: 0,
                companyCount: 0,
                successfulDeals: 0,
                totalDeals: 0
            });

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Обрабатываем данные по компаниям
        companies.forEach(companyData => {
            // Фильтруем сделки по пользователям
            const userFilteredDeals = assignedUsers.length === 0
                ? companyData.deals
                : companyData.deals.filter(deal => assignedUsers.includes(deal.assignedById));

            // Фильтруем сделки по периоду
            const periodDeals = userFilteredDeals.filter(deal => {
                const dealFrom = new Date(deal.from);
                const dealTo = new Date(deal.to);
                return dealFrom <= endDateObj && dealTo >= new Date(startDate);
            });

            if (periodDeals.length === 0) return;

            // Рассчитываем ежемесячные платежи
            const monthlyPayments = periodDeals.flatMap(deal => calculateMonthlyPayments(deal));

            // Группируем по месяцам
            monthlyPayments.forEach(payment => {
                const dealFrom = new Date(payment.deal.from);
                const paymentDate = new Date(dealFrom);
                paymentDate.setMonth(dealFrom.getMonth() + payment.month);

                const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
                const monthData = monthlyData.get(monthKey);

                if (monthData) {
                    monthData.totalRevenue += payment.amount;
                }
            });

            // Рассчитываем индексацию для компании
            const indexGrowth = calculateTrendIndexGrowth(periodDeals);

            // Добавляем данные по индексации
            monthlyData.forEach((monthData, monthKey) => {
                monthData.totalIndex += indexGrowth;
                monthData.companyCount += 1;

                // Считаем успешные сделки
                const monthDeals = periodDeals.filter(deal => {
                    const dealFrom = new Date(deal.from);
                    const dealTo = new Date(deal.to);
                    const dealMonth = new Date(dealFrom.getFullYear(), dealFrom.getMonth());
                    const monthKeyParts = monthKey.split('-');
                    return dealMonth.getFullYear() === parseInt(monthKeyParts[0] || '0') &&
                        dealMonth.getMonth() === parseInt(monthKeyParts[1] || '0') - 1;
                });

                monthData.successfulDeals += monthDeals.filter(deal => deal.isWon || deal.isInProgress).length;
                monthData.totalDeals += monthDeals.length;
            });
        });

        // Преобразуем в массивы для графиков, сортируем по месяцам
        const sortedMonthlyData = Array.from(monthlyData.values()).sort((a, b) => {
            const aParts = a.month.split(' ');
            const bParts = b.month.split(' ');
            const dateA = new Date(parseInt(aParts[1] || '0'), getMonthIndex(aParts[0] || ''));
            const dateB = new Date(parseInt(bParts[1] || '0'), getMonthIndex(bParts[0] || ''));
            return dateA.getTime() - dateB.getTime();
        });

        const revenueData = sortedMonthlyData.map(data => ({
            month: data.month,
            value: data.totalRevenue
        }));

        const indexData = sortedMonthlyData.map(data => ({
            month: data.month,
            value: data.companyCount > 0 ? data.totalIndex / data.companyCount : 0
        }));

        const successRateData = sortedMonthlyData.map(data => ({
            month: data.month,
            value: data.totalDeals > 0 ? (data.successfulDeals / data.totalDeals) * 100 : 0
        }));

        // Данные для pie chart (распределение по статусам)
        const totalDeals = companies.reduce((sum, company) => sum + company.deals.length, 0);
        const wonDeals = companies.reduce((sum, company) =>
            sum + company.deals.filter(deal => deal.isWon).length, 0
        );
        const inProgressDeals = companies.reduce((sum, company) =>
            sum + company.deals.filter(deal => deal.isInProgress).length, 0
        );
        const lostDeals = companies.reduce((sum, company) =>
            sum + company.deals.filter(deal => deal.isLost).length, 0
        );

        const statusData = [
            {
                label: `Успешные (${wonDeals})`,
                value: wonDeals,
                color: '#10b981'
            },
            {
                label: `В процессе (${inProgressDeals})`,
                value: inProgressDeals,
                color: '#3b82f6'
            },
            {
                label: `Отклоненные (${lostDeals})`,
                value: lostDeals,
                color: '#ef4444'
            }
        ].filter(item => item.value > 0); // Показываем только ненулевые значения

        // Дополнительные данные для pie charts
        const userRevenueData = calculateUserRevenue(companies, assignedUsers);
        const userCompaniesData = calculateUserCompanies(companies, assignedUsers);
        const companyRevenueData = calculateCompanyRevenue(companies, assignedUsers);
        const yearlyRevenueData = calculateYearlyRevenue(companies, assignedUsers, startDate, endDate);

        return {
            revenueData,
            indexData,
            successRateData,
            statusData,
            userRevenueData,
            userCompaniesData,
            companyRevenueData,
            yearlyRevenueData
        };
    }, [companies, startDate, endDate, assignedUsers]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChart
                    data={analyticsData.revenueData}
                    title={`Динамика выручки по месяцам (${analyticsData.revenueData.reduce((sum, item) => sum + item.value, 0).toLocaleString('ru-RU')} ₽)`}
                    yAxisLabel="Выручка"
                    color="#3b82f6"
                />

                <LineChart
                    data={analyticsData.indexData}
                    title={`Средняя индексация по месяцам (${analyticsData.indexData.length > 0 ? (analyticsData.indexData.reduce((sum, item) => sum + item.value, 0) / analyticsData.indexData.length).toFixed(1) : 0}%)`}
                    yAxisLabel="Индексация (%)"
                    color="#10b981"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart
                    data={analyticsData.successRateData}
                    title={`Процент успешных сделок по месяцам (${analyticsData.successRateData.length > 0 ? (analyticsData.successRateData.reduce((sum, item) => sum + item.value, 0) / analyticsData.successRateData.length).toFixed(1) : 0}%)`}
                    yAxisLabel="Процент (%)"
                    color="#f59e0b"
                />

                <PieChart
                    data={analyticsData.statusData}
                    title={`Распределение сделок по статусам (${analyticsData.statusData.reduce((sum, item) => sum + item.value, 0)} сделок)`}
                />
            </div>

            {/* Дополнительные круговые диаграммы */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart
                    data={analyticsData.userRevenueData}
                    title={`Распределение доходов по сотрудникам (${analyticsData.userRevenueData.reduce((sum, item) => sum + item.value, 0).toLocaleString('ru-RU')} ₽)`}
                />

                <PieChart
                    data={analyticsData.userCompaniesData}
                    title={`Распределение компаний по сотрудникам (${analyticsData.userCompaniesData.reduce((sum, item) => sum + item.value, 0)} компаний)`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart
                    data={analyticsData.companyRevenueData}
                    title={`Выручка по компаниям (${analyticsData.companyRevenueData.reduce((sum, item) => sum + item.value, 0).toLocaleString('ru-RU')} ₽)`}
                />

                <PieChart
                    data={analyticsData.yearlyRevenueData}
                    title={`Распределение выручки по ${new Date(startDate).getFullYear() === new Date(endDate).getFullYear() ? 'месяцам' : 'годам'} (${analyticsData.yearlyRevenueData.reduce((sum, item) => sum + item.value, 0).toLocaleString('ru-RU')} ₽)`}
                />
            </div>
        </div>
    );
};
