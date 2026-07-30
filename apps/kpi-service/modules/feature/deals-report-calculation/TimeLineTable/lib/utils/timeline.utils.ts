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
 * Кап длительности сделки: защита от аномальных дат («до 2099») —
 * такая сделка генерила тысячи объектов платежей на каждый расчёт.
 * 120 месяцев (10 лет) заведомо покрывает реальные договоры.
 */
export const DEAL_DURATION_CAP_MONTHS = 120;

/** Аномальные сделки логируем один раз, а не на каждый пересчёт. */
const warnedAnomalousDeals = new Set<number | string>();

/**
 * Рассчитать ежемесячные платежи.
 *
 * rangeStart/rangeEnd (опционально) — не генерировать платежи за пределами
 * диапазона: горячий путь таблицы отбрасывал их после создания. Без
 * аргументов поведение прежнее (полный срок сделки) — его ждут статистика
 * (currentTotal по календарному году) и детализация сделки.
 */
export function calculateMonthlyPayments(
    deal: OrkReportDealItemDto,
    rangeStart?: Date,
    rangeEnd?: Date,
): MonthlyPayment[] {
    const from = new Date(deal.from);
    const to = new Date(deal.to);
    const totalSum = +deal.sum;
    const duration = deal.duration || getDealDuration(deal);
    const monthlyAmount = deal.monthSum || (totalSum / duration);

    const payments: MonthlyPayment[] = [];

    // Используем duration из данных сделки, а не рассчитываем заново
    let actualDurationMonths = Math.max(1, duration);
    if (actualDurationMonths > DEAL_DURATION_CAP_MONTHS) {
        if (!warnedAnomalousDeals.has(deal.id)) {
            warnedAnomalousDeals.add(deal.id);
            console.warn(
                `[timeline] Сделка #${deal.id} «${deal.title ?? ''}»: ` +
                    `аномальная длительность ${actualDurationMonths} мес ` +
                    `(${deal.from} – ${deal.to}), обрезано до ` +
                    `${DEAL_DURATION_CAP_MONTHS} — проверьте даты сделки в CRM.`,
            );
        }
        actualDurationMonths = DEAL_DURATION_CAP_MONTHS;
    }

    for (let i = 0; i < actualDurationMonths; i++) {
        const paymentDate = new Date(from);
        paymentDate.setMonth(paymentDate.getMonth() + i);

        // Даты платежей монотонно растут — за правой границей можно выходить.
        if (rangeEnd && paymentDate > rangeEnd) break;
        if (rangeStart && paymentDate < rangeStart) continue;

        // Проверяем, что платеж не выходит за рамки сделки
        if (paymentDate <= to) {
            payments.push({
                month: i, // Используем индекс i, а не месяц даты
                year: paymentDate.getFullYear(),
                monthIndex: paymentDate.getMonth(),
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

/** Сделки, пересекающиеся с периодом (после фильтра по пользователям). */
function getPeriodDeals(
    deals: OrkReportDealItemDto[],
    startDate: Date,
    endDate: Date,
    assignedUsers: string[],
): OrkReportDealItemDto[] {
    const userFilteredDeals = filterDealsByUsers(deals, assignedUsers);
    // Сделка пересекается с периодом, если начинается до его конца и
    // заканчивается после его начала
    return userFilteredDeals.filter(deal => {
        const dealFrom = new Date(deal.from);
        const dealTo = new Date(deal.to);
        return dealFrom <= endDate && dealTo >= startDate;
    });
}

/** Статистика из УЖЕ рассчитанных платежей (единый расчёт на компанию). */
function buildStatsFromPayments(
    periodDeals: OrkReportDealItemDto[],
    monthlyPayments: MonthlyPayment[],
): CompanyStats {
    // Общая сумма всех сделок (включая пересекающиеся)
    const totalSum = periodDeals.reduce((sum, deal) => sum + +deal.sum, 0);
    const successfulDeals = periodDeals.filter(deal => deal.isWon || deal.isInProgress).length;

    // Группируем платежи по месяцам и суммируем (для учета пересекающихся сделок)
    const monthlyTotals = new Map<number, number>();
    monthlyPayments.forEach(payment => {
        monthlyTotals.set(payment.monthIndex, (monthlyTotals.get(payment.monthIndex) || 0) + payment.amount);
    });

    // Сумма ежемесячных платежей в текущем календарном году
    const currentYear = new Date().getFullYear();
    const currentTotal = monthlyPayments.reduce(
        (sum, payment) => payment.year === currentYear ? sum + payment.amount : sum,
        0
    );

    // Средняя сумма в месяц только по месяцам с платежами
    const totalPaymentsAmount = Array.from(monthlyTotals.values()).reduce((sum, amount) => sum + amount, 0);
    const monthsWithPayments = monthlyTotals.size;
    const averageMonthly = monthsWithPayments > 0 ? totalPaymentsAmount / monthsWithPayments : 0;

    // Индексация по тренду — устойчива к скачкам
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

/** Матрица год×месяц из УЖЕ рассчитанных платежей. */
function buildYearlyMatrixFromPayments(
    years: number[],
    monthlyPayments: MonthlyPayment[],
): YearlyData[] {
    const totalsByYear = new Map<number, number[]>(
        years.map(year => [year, Array.from({ length: 12 }, () => 0)])
    );

    monthlyPayments.forEach(payment => {
        const yearTotals = totalsByYear.get(payment.year);
        if (yearTotals) {
            yearTotals[payment.monthIndex] = (yearTotals[payment.monthIndex] || 0) + payment.amount;
        }
    });

    return years.map(year => ({
        year,
        monthlyTotals: totalsByYear.get(year) || Array.from({ length: 12 }, () => 0)
    }));
}

/** Полный расчёт строки таймлайна одной компании. */
export interface CompanyTimeline {
    stats: CompanyStats;
    yearlyMatrix: YearlyData[];
}

/** Готовая строка таблицы: компания + предрассчитанные метрики. */
export interface TimelineCompanyRow extends CompanyTimeline {
    companyData: OrkReportDealsByCompaniesDto;
    crossYearIndexes: YearToYearIndex[];
}

/**
 * ЕДИНЫЙ расчёт компании: платежи каждой сделки считаются ОДИН раз и
 * питают и статистику, и матрицу год×месяц. Раньше горячий путь считал
 * calculateMonthlyPayments до трёх раз на сделку (stats в фильтре
 * индексации + stats в таблице + матрица).
 */
export function buildCompanyTimeline(
    companyData: OrkReportDealsByCompaniesDto,
    startDate: Date,
    endDate: Date,
    assignedUsers: string[] = [],
): CompanyTimeline {
    const periodDeals = getPeriodDeals(companyData.deals, startDate, endDate, assignedUsers);
    // Полный срок сделки (без клиппинга): currentTotal/averageMonthly
    // исторически считаются по всем платежам сделки, матрица сама
    // отбрасывает чужие годы.
    const monthlyPayments = periodDeals.flatMap(deal => calculateMonthlyPayments(deal));
    const years = getYearsInPeriod(startDate, endDate);

    return {
        stats: buildStatsFromPayments(periodDeals, monthlyPayments),
        yearlyMatrix: buildYearlyMatrixFromPayments(years, monthlyPayments),
    };
}

/**
 * Рассчитать статистику компании
 */
export function calculateCompanyStats(companyData: OrkReportDealsByCompaniesDto, startDate: Date, endDate: Date, assignedUsers: string[] = []): CompanyStats {
    const periodDeals = getPeriodDeals(companyData.deals, startDate, endDate, assignedUsers);
    const monthlyPayments = periodDeals.flatMap(deal => calculateMonthlyPayments(deal));
    return buildStatsFromPayments(periodDeals, monthlyPayments);
}

/**
 * Рассчитать матрицу по годам
 */
export function calculateYearlyMatrix(companyData: OrkReportDealsByCompaniesDto, startDate: Date, endDate: Date, assignedUsers: string[] = []): YearlyData[] {
    const periodDeals = getPeriodDeals(companyData.deals, startDate, endDate, assignedUsers);
    const years = getYearsInPeriod(startDate, endDate);
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    if (firstYear === undefined || lastYear === undefined) return [];
    // Клиппинг ГОДОВОЙ гранулярности (эквивалентен прежнему отбрасыванию
    // «чужих» годов картой totalsByYear) — платежи вне диапазона просто
    // не создаются вместо создать-и-выбросить.
    const clipStart = new Date(firstYear, 0, 1);
    const clipEnd = new Date(lastYear + 1, 0, 1);
    const monthlyPayments = periodDeals.flatMap(deal =>
        calculateMonthlyPayments(deal, clipStart, clipEnd),
    );
    return buildYearlyMatrixFromPayments(years, monthlyPayments);
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
