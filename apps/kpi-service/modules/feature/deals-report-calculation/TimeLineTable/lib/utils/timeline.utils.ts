import { OrkReportDealsByCompaniesDto, OrkReportDealItemDto } from "@workspace/nest-api";
import { getDealDuration } from "../../../../../entities/deals-report/lib/calculation.util";
import {
    MonthlyPayment,
    CompanyStats,
    YearlyData,
    MonthRange,
    PeriodRange
} from "../../model/types";

/**
 * Получить месяцы года
 */
export function getMonthsOfYear(year: number): MonthRange {
    const months = Array.from({ length: 12 }).map((_, i) =>
        new Date(year, i, 1).toLocaleString('ru-RU', { month: 'short' }),
    );
    return { year, months };
}

/**
 * Получить месяцы периода
 */
export function getMonthsOfPeriod(startYear: number, endYear: number): PeriodRange {
    const months: string[] = [];
    for (let year = startYear; year <= endYear; year++) {
        const yearMonths = Array.from({ length: 12 }).map((_, i) =>
            new Date(year, i, 1).toLocaleString('ru-RU', { month: 'short' }),
        );
        months.push(...yearMonths);
    }
    return { startYear, endYear, months };
}

/**
 * Получить годы в периоде
 */
export function getYearsInPeriod(startDate: Date, endDate: Date): number[] {
    const years: number[] = [];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
        years.push(year);
    }
    return years;
}

/**
 * Получить названия месяцев
 */
export function getMonthlyLabels(): string[] {
    return Array.from({ length: 12 }).map((_, i) =>
        new Date(2024, i, 1).toLocaleString('ru-RU', { month: 'short' }),
    );
}

/**
 * Получить минимальную дату из сделок
 */
export function getMinDateFromDeals(companies: OrkReportDealsByCompaniesDto[]): Date {
    let minDate = new Date();

    companies.forEach(companyData => {
        companyData.deals.forEach(deal => {
            const dealDate = new Date(deal.from);
            if (dealDate < minDate) {
                minDate = dealDate;
            }
        });
    });

    return minDate;
}

/**
 * Рассчитать ежемесячные платежи
 */
export function calculateMonthlyPayments(deal: OrkReportDealItemDto): MonthlyPayment[] {
    const from = new Date(deal.from);
    const to = new Date(deal.to);
    const totalSum = +deal.sum;
    const duration = deal.duration || getDealDuration(deal);
    const monthlyAmount = deal.monthSum || (totalSum / duration);

    const payments: MonthlyPayment[] = [];

    // Используем duration из данных сделки, а не рассчитываем заново
    const actualDurationMonths = Math.max(1, duration);

    for (let i = 0; i < actualDurationMonths; i++) {
        const paymentDate = new Date(from);
        paymentDate.setMonth(paymentDate.getMonth() + i);

        // Проверяем, что платеж не выходит за рамки сделки
        if (paymentDate <= to) {
            payments.push({
                month: i, // Используем индекс i, а не месяц даты
                amount: monthlyAmount,
                deal
            });
        }
    }

    return payments;
}

/**
 * Фильтровать сделки по пользователям
 */
export function filterDealsByUsers(deals: OrkReportDealItemDto[], assignedUsers: string[]): OrkReportDealItemDto[] {
    if (assignedUsers.length === 0) return deals;
    return deals.filter(deal => assignedUsers.includes(deal.assignedById));
}

/**
 * Рассчитать статистику компании
 */
export function calculateCompanyStats(companyData: OrkReportDealsByCompaniesDto, startDate: Date, endDate: Date, assignedUsers: string[] = []): CompanyStats {
    const { deals } = companyData;

    // Фильтруем сделки по пользователям
    const userFilteredDeals = filterDealsByUsers(deals, assignedUsers);

    // Фильтруем сделки, которые пересекаются с выбранным периодом
    const periodDeals = userFilteredDeals.filter(deal => {
        const dealFrom = new Date(deal.from);
        const dealTo = new Date(deal.to);
        // Сделка пересекается с периодом, если она начинается до конца периода и заканчивается после начала периода
        return dealFrom <= endDate && dealTo >= startDate;
    });

    // Рассчитываем общую сумму всех сделок (включая пересекающиеся)
    const totalSum = periodDeals.reduce((sum, deal) => sum + +deal.sum, 0);
    const successfulDeals = periodDeals.filter(deal => deal.isWon || deal.isInProgress).length;

    // Рассчитываем ежемесячные платежи с учетом пересекающихся сделок
    const monthlyPayments = periodDeals.flatMap(deal => calculateMonthlyPayments(deal));

    // Группируем платежи по месяцам и суммируем (для учета пересекающихся сделок)
    const monthlyTotals = new Map<number, number>();
    monthlyPayments.forEach(payment => {
        const dealFrom = new Date(payment.deal.from);
        const paymentDate = new Date(dealFrom);
        paymentDate.setMonth(dealFrom.getMonth() + payment.month);
        const month = paymentDate.getMonth();
        monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + payment.amount);
    });

    // Рассчитываем сумму ежемесячных платежей в текущем году
    const currentYear = new Date().getFullYear();
    const currentYearPayments = monthlyPayments.filter(payment => {
        const dealFrom = new Date(payment.deal.from);
        const paymentDate = new Date(dealFrom);
        paymentDate.setMonth(dealFrom.getMonth() + payment.month);
        return paymentDate.getFullYear() === currentYear;
    });
    const currentTotal = currentYearPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Рассчитываем среднюю сумму в месяц только по месяцам с платежами
    const totalPaymentsAmount = Array.from(monthlyTotals.values()).reduce((sum, amount) => sum + amount, 0);
    const monthsWithPayments = monthlyTotals.size;
    const averageMonthly = monthsWithPayments > 0 ? totalPaymentsAmount / monthsWithPayments : 0;

    // Рассчитываем индексацию на основе ежемесячных платежей
    // Используем тренд для более устойчивого расчета при скачках
    const indexGrowth = calculateTrendIndexGrowth(periodDeals);

    return {
        currentTotal,
        averageMonthly,
        periodTotal: totalSum,
        dealCount: periodDeals.length,
        successRate: periodDeals.length > 0 ? (successfulDeals / periodDeals.length) * 100 : 0,
        indexGrowth
    };
}

/**
 * Рассчитать матрицу по годам
 */
export function calculateYearlyMatrix(companyData: OrkReportDealsByCompaniesDto, startDate: Date, endDate: Date, assignedUsers: string[] = []): YearlyData[] {
    let { deals } = companyData;

    // Фильтруем сделки по пользователям, если указаны
    if (assignedUsers.length > 0) {
        deals = filterDealsByUsers(deals, assignedUsers);
    }

    const years = getYearsInPeriod(startDate, endDate);

    // Сначала получаем все сделки, которые пересекаются с общим периодом
    const periodDeals = deals.filter(deal => {
        const dealFrom = new Date(deal.from);
        const dealTo = new Date(deal.to);
        return dealFrom <= endDate && dealTo >= startDate;
    });

    return years.map(year => {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);

        // Фильтруем сделки, которые пересекаются с конкретным годом
        const yearDeals = periodDeals.filter(deal => {
            const dealFrom = new Date(deal.from);
            const dealTo = new Date(deal.to);
            return dealFrom <= yearEnd && dealTo >= yearStart;
        });

        // Рассчитываем ежемесячные платежи для всех сделок года
        const monthlyPayments = yearDeals.flatMap(deal => calculateMonthlyPayments(deal));

        // Группируем платежи по месяцам и суммируем (для учета пересекающихся сделок)
        const monthlyTotals = Array.from({ length: 12 }).map((_, month) => {
            const monthPayments = monthlyPayments.filter(payment => {
                const dealFrom = new Date(payment.deal.from);
                const paymentDate = new Date(dealFrom);
                paymentDate.setMonth(dealFrom.getMonth() + payment.month);


                return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
            });

            // Суммируем все платежи за месяц (включая пересекающиеся сделки)
            return monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
        });

        return {
            year,
            monthlyTotals
        };
    });
}

/**
 * Рассчитать индексацию роста на основе ежемесячных платежей
 */
export function calculateMonthlyIndexGrowth(deals: OrkReportDealItemDto[]): number {
    if (deals.length < 2) return 0;

    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    // Рассчитываем ежемесячные платежи для всех сделок
    const monthlyAmounts = sortedDeals.map(deal =>
        deal.monthSum || (+deal.sum / (deal.duration || 1))
    );

    // Если все суммы одинаковые, индексация = 0
    const allSame = monthlyAmounts.every(amount => amount === monthlyAmounts[0]);
    if (allSame) return 0;

    // Рассчитываем среднюю индексацию между соседними сделками
    let totalGrowth = 0;
    let validComparisons = 0;

    for (let i = 1; i < monthlyAmounts.length; i++) {
        const prevAmount = monthlyAmounts[i - 1];
        const currentAmount = monthlyAmounts[i];

        if (prevAmount && currentAmount && prevAmount > 0) {
            const growth = ((currentAmount - prevAmount) / prevAmount) * 100;
            totalGrowth += growth;
            validComparisons++;
        }
    }

    // Возвращаем среднюю индексацию между соседними сделками
    return validComparisons > 0 ? totalGrowth / validComparisons : 0;
}

/**
 * Рассчитать индексацию роста по тренду (более устойчив к скачкам)
 */
export function calculateTrendIndexGrowth(deals: OrkReportDealItemDto[]): number {
    if (deals.length < 2) return 0;

    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    // Рассчитываем ежемесячные платежи для всех сделок
    const monthlyAmounts = sortedDeals.map(deal =>
        deal.monthSum || (+deal.sum / (deal.duration || 1))
    );

    // Если все суммы одинаковые, индексация = 0
    const allSame = monthlyAmounts.every(amount => amount === monthlyAmounts[0]);
    if (allSame) return 0;

    // Простая линейная регрессия для расчета тренда
    const n = monthlyAmounts.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = monthlyAmounts;

    // Рассчитываем коэффициенты линейной регрессии
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * (y[i] || 0), 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Рассчитываем процентное изменение от начала до конца тренда
    const startTrend = intercept;
    const endTrend = slope * (n - 1) + intercept;

    if (startTrend === 0) return 0;

    return ((endTrend - startTrend) / startTrend) * 100;
}

/**
 * Рассчитать индексацию роста (старая версия для совместимости)
 */
export function calculateIndexGrowth(deals: OrkReportDealItemDto[]): number {
    if (deals.length < 2) return 0;

    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
    const firstDeal = sortedDeals[0];
    const lastDeal = sortedDeals[sortedDeals.length - 1];

    if (!firstDeal || !lastDeal) return 0;

    const firstSum = +firstDeal.sum;
    const lastSum = +lastDeal.sum;

    if (firstSum === 0) return 0;

    return ((lastSum - firstSum) / firstSum) * 100;
}

/**
 * Получить цвет для сделки
 */
export function getDealColor(current: number, previous?: number, sumTotal?: number) {
    // Если нет суммы вообще
    if (current === 0) return 'bg-gray-400';

    // Если есть предыдущее значение для сравнения
    if (previous !== undefined) {
        if (current > previous) return 'bg-green-600';
        if (current < previous) return 'bg-red-500';
        return 'bg-blue-400'; // Если равны
    }

    // Если есть сумма, но нет предыдущего значения для сравнения
    if (current > 0) return 'bg-blue-400';

    // По умолчанию серый
    return 'bg-gray-400';
}

/**
 * Интерфейс для индексации между двумя годами
 */
export interface YearToYearIndex {
    fromYear: number;
    toYear: number;
    indexGrowth: number;
}

/**
 * Рассчитать итоговую индексацию за несколько лет
 * Сравнивает одинаковые месяцы разных лет (январь 2024 к январю 2025 и т.д.)
 * Исключает случаи с пиками (когда было 0, потом появилось значение)
 * Возвращает массив индексаций для каждой пары лет
 */
export function calculateCrossYearIndexGrowth(yearlyMatrix: YearlyData[]): YearToYearIndex[] {
    if (yearlyMatrix.length < 2) return [];

    const results: YearToYearIndex[] = [];

    // Для каждой пары лет (год к году)
    for (let i = 1; i < yearlyMatrix.length; i++) {
        const fromYear = yearlyMatrix[i - 1];
        const toYear = yearlyMatrix[i];

        if (!fromYear || !toYear) continue;

        const monthIndexes = Array.from({ length: 12 }, (_, j) => j);
        const growths: number[] = [];

        // Для каждого месяца (0-11)
        monthIndexes.forEach(monthIndex => {
            const fromValue = fromYear.monthlyTotals[monthIndex] || 0;
            const toValue = toYear.monthlyTotals[monthIndex] || 0;

            // Исключаем пики в обе стороны:
            // 1. Если было 0, а стало > 0 (появление нового комплекта)
            // 2. Если было > 0, а стало 0 (пропадание комплекта)
            if ((fromValue === 0 && toValue > 0) || (fromValue > 0 && toValue === 0)) {
                return; // Пропускаем этот случай
            }

            // Если оба значения > 0, считаем процент роста
            if (fromValue > 0 && toValue > 0) {
                const growth = ((toValue - fromValue) / fromValue) * 100;
                growths.push(growth);
            }
        });

        // Рассчитываем среднее арифметическое для этой пары лет
        const averageGrowth = growths.length > 0
            ? growths.reduce((acc, val) => acc + val, 0) / growths.length
            : 0;

        results.push({
            fromYear: fromYear.year,
            toYear: toYear.year,
            indexGrowth: averageGrowth
        });
    }

    return results;
}

// Экспортируем getDealDuration для использования в компонентах
export { getDealDuration };
