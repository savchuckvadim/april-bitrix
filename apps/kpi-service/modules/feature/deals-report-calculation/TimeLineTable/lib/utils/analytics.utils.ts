import { OrkReportDealsByCompaniesDto, OrkReportDealItemDto } from "@workspace/nest-api";
import {
    ImplementationIndex,
    MonthlyIndexData,
    CompanyHeatmapData
} from "../../model/types";

/**
 * Рассчитать индекс реализации для компании
 */
export function calculateImplementationIndex(companyData: OrkReportDealsByCompaniesDto): ImplementationIndex {
    const { company, deals } = companyData;

    if (deals.length === 0) {
        return {
            companyId: company.id,
            companyName: company.title,
            deals: [],
            avgIndex: 0,
            realizationRate: 0
        };
    }

    // Сортируем сделки по дате
    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    const dealIndexes = sortedDeals.map((deal, index) => {
        const sum = +deal.sum;
        let indexValue = 0;

        if (index > 0) {
            const prevDeal = sortedDeals[index - 1];
            const prevSum = prevDeal ? +prevDeal.sum : 0;
            if (prevSum > 0) {
                indexValue = ((sum - prevSum) / prevSum) * 100;
            }
        }

        const realization = (deal.isWon || deal.isInProgress) ? 1 : 0;

        return {
            date: deal.from,
            sum,
            index: indexValue,
            realization
        };
    });

    const avgIndex = dealIndexes.reduce((sum, deal) => sum + deal.index, 0) / dealIndexes.length;
    const successfulDeals = dealIndexes.filter(deal => deal.realization === 1).length;
    const realizationRate = (successfulDeals / dealIndexes.length) * 100;

    return {
        companyId: company.id,
        companyName: company.title,
        deals: dealIndexes,
        avgIndex,
        realizationRate
    };
}

/**
 * Рассчитать месячные данные индексации
 */
export function calculateMonthlyIndexData(companies: OrkReportDealsByCompaniesDto[]): MonthlyIndexData[] {
    const monthlyData = new Map<string, {
        totalDeals: number;
        successfulDeals: number;
        realizationRevenue: number;
        totalSum: number;
        indexes: number[];
    }>();

    companies.forEach(companyData => {
        const { deals } = companyData;

        deals.forEach(deal => {
            const dealDate = new Date(deal.from);
            const monthKey = dealDate.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'short'
            });

            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, {
                    totalDeals: 0,
                    successfulDeals: 0,
                    realizationRevenue: 0,
                    totalSum: 0,
                    indexes: []
                });
            }

            const monthData = monthlyData.get(monthKey)!;
            monthData.totalDeals += 1;
            monthData.totalSum += +deal.sum;

            if (deal.isWon || deal.isInProgress) {
                monthData.successfulDeals += 1;
                monthData.realizationRevenue += +deal.sum;
            }

            // Рассчитываем индекс для этой сделки
            const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
            const dealIndex = sortedDeals.findIndex(d => d.id === deal.id);

            if (dealIndex > 0) {
                const prevDeal = sortedDeals[dealIndex - 1];
                const prevSum = prevDeal ? +prevDeal.sum : 0;
                const currentSum = +deal.sum;

                if (prevSum > 0) {
                    const indexValue = ((currentSum - prevSum) / prevSum) * 100;
                    monthData.indexes.push(indexValue);
                }
            }
        });
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        avgIndex: data.indexes.length > 0
            ? data.indexes.reduce((sum, index) => sum + index, 0) / data.indexes.length
            : 0,
        totalDeals: data.totalDeals,
        successfulDeals: data.successfulDeals,
        realizationRevenue: data.realizationRevenue,
        avgDealSum: data.totalDeals > 0 ? data.totalSum / data.totalDeals : 0
    })).sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Рассчитать данные для тепловой карты
 */
export function calculateHeatmapData(companies: OrkReportDealsByCompaniesDto[]): CompanyHeatmapData[] {
    return companies.map(companyData => {
        const { company, deals } = companyData;

        // Группируем сделки по кварталам
        const quarterlyData = new Map<string, {
            deals: OrkReportDealItemDto[];
            totalSum: number;
            successfulSum: number;
        }>();

        deals.forEach(deal => {
            const dealDate = new Date(deal.from);
            const year = dealDate.getFullYear();
            const quarter = Math.floor(dealDate.getMonth() / 3) + 1;
            const quarterKey = `Q${quarter} ${year}`;

            if (!quarterlyData.has(quarterKey)) {
                quarterlyData.set(quarterKey, {
                    deals: [],
                    totalSum: 0,
                    successfulSum: 0
                });
            }

            const quarterData = quarterlyData.get(quarterKey)!;
            quarterData.deals.push(deal);
            quarterData.totalSum += +deal.sum;

            if (deal.isWon || deal.isInProgress) {
                quarterData.successfulSum += +deal.sum;
            }
        });

        const periods = Array.from(quarterlyData.entries()).map(([period, data]) => {
            // Рассчитываем средний индекс для квартала
            const sortedDeals = [...data.deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
            let avgIndex = 0;

            if (sortedDeals.length > 1) {
                const indexes = [];
                for (let i = 1; i < sortedDeals.length; i++) {
                    const prevSum = sortedDeals[i - 1] ? +sortedDeals[i - 1]!.sum : 0;
                    const currentSum = sortedDeals[i] ? +sortedDeals[i]!.sum : 0;
                    if (prevSum > 0) {
                        indexes.push(((currentSum - prevSum) / prevSum) * 100);
                    }
                }
                avgIndex = indexes.length > 0
                    ? indexes.reduce((sum, index) => sum + index, 0) / indexes.length
                    : 0;
            }

            return {
                period,
                index: avgIndex,
                realization: data.successfulSum,
                deals: data.deals.length
            };
        });

        return {
            company: company.title,
            periods
        };
    });
}

/**
 * Получить цвет для тепловой карты
 */
export function getHeatmapColor(value: number, type: 'index' | 'realization'): string {
    if (type === 'index') {
        if (value > 20) return '#22c55e'; // Зеленый для роста > 20%
        if (value > 0) return '#84cc16'; // Светло-зеленый для роста 0-20%
        if (value > -20) return '#eab308'; // Желтый для падения 0-20%
        return '#ef4444'; // Красный для падения > 20%
    } else { // realization
        if (value > 1000000) return '#22c55e'; // Зеленый для > 1M
        if (value > 500000) return '#84cc16'; // Светло-зеленый для 500K-1M
        if (value > 100000) return '#eab308'; // Желтый для 100K-500K
        if (value > 0) return '#f59e0b'; // Оранжевый для > 0
        return '#6b7280'; // Серый для 0
    }
}
