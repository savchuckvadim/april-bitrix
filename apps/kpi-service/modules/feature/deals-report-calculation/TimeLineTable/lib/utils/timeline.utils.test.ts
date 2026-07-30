import { describe, expect, it } from 'vitest';
import type {
    OrkReportDealItemDto,
    OrkReportDealsByCompaniesDto,
} from '@workspace/nest-api';
import {
    buildCompanyTimeline,
    calculateCompanyStats,
    calculateMonthlyPayments,
    calculateYearlyMatrix,
    DEAL_DURATION_CAP_MONTHS,
    getMinDateFromDeals,
    getYearsInPeriod,
} from './timeline.utils';

/** Минимальная сделка для расчётов (лишние поля таймлайну не нужны). */
const deal = (
    overrides: Partial<OrkReportDealItemDto> = {},
): OrkReportDealItemDto =>
    ({
        id: overrides.id ?? 1,
        title: 'Сделка',
        sum: '1200',
        monthSum: 0,
        duration: 12,
        from: '2025-01-15T00:00:00.000Z',
        to: '2025-12-31T00:00:00.000Z',
        assignedById: '10',
        isWon: true,
        isLost: false,
        isInProgress: false,
        ...overrides,
    }) as OrkReportDealItemDto;

const company = (
    deals: OrkReportDealItemDto[],
): OrkReportDealsByCompaniesDto =>
    ({
        company: { id: 1, title: 'Компания', isActiveClient: true },
        deals,
    }) as OrkReportDealsByCompaniesDto;

describe('calculateMonthlyPayments', () => {
    it('генерит платёж на каждый месяц срока с равной месячной суммой', () => {
        const payments = calculateMonthlyPayments(
            deal({ sum: '300', duration: 3, to: '2025-03-31T00:00:00.000Z' }),
        );

        expect(payments).toHaveLength(3);
        expect(payments.every(payment => payment.amount === 100)).toBe(true);
        expect(payments.map(payment => payment.monthIndex)).toEqual([0, 1, 2]);
        expect(payments.every(payment => payment.year === 2025)).toBe(true);
    });

    it('платежи за пределами deal.to не создаются', () => {
        // duration 12, но сделка фактически заканчивается в марте
        const payments = calculateMonthlyPayments(
            deal({ duration: 12, to: '2025-03-31T00:00:00.000Z' }),
        );
        expect(payments).toHaveLength(3);
    });

    it('аномальная длительность (сделка «до 2099») обрезается капом', () => {
        const payments = calculateMonthlyPayments(
            deal({
                id: 999,
                duration: 900,
                from: '2025-01-01T00:00:00.000Z',
                to: '2099-12-31T00:00:00.000Z',
            }),
        );
        expect(payments).toHaveLength(DEAL_DURATION_CAP_MONTHS);
    });

    it('rangeStart/rangeEnd отсекают платежи вне диапазона', () => {
        const target = deal({ duration: 12 });
        const clipped = calculateMonthlyPayments(
            target,
            new Date(2025, 2, 1), // март
            new Date(2025, 5, 30), // июнь
        );
        expect(clipped.every(payment => payment.year === 2025)).toBe(true);
        expect(
            clipped.every(
                payment => payment.monthIndex >= 2 && payment.monthIndex <= 5,
            ),
        ).toBe(true);
        expect(clipped).toHaveLength(4);
    });

    it('monthSum из сделки приоритетнее расчётной месячной суммы', () => {
        const payments = calculateMonthlyPayments(
            deal({ monthSum: 500, sum: '1200', duration: 2, to: '2025-02-28T00:00:00.000Z' }),
        );
        expect(payments.every(payment => payment.amount === 500)).toBe(true);
    });
});

describe('calculateYearlyMatrix', () => {
    it('раскладывает платежи по матрице год×месяц', () => {
        const matrix = calculateYearlyMatrix(
            company([
                deal({
                    sum: '1200',
                    duration: 12,
                    from: '2025-07-15T00:00:00.000Z',
                    to: '2026-06-30T00:00:00.000Z',
                }),
            ]),
            new Date(2025, 0, 1),
            new Date(2026, 11, 31),
        );

        expect(matrix.map(year => year.year)).toEqual([2025, 2026]);
        const y2025 = matrix[0]?.monthlyTotals ?? [];
        const y2026 = matrix[1]?.monthlyTotals ?? [];
        // Июль–декабрь 2025 (6 платежей) + январь–июнь 2026 (6 платежей)
        expect(y2025.filter(amount => amount > 0)).toHaveLength(6);
        expect(y2026.filter(amount => amount > 0)).toHaveLength(6);
        expect(y2025[6]).toBe(100); // июль 2025
        expect(y2026[5]).toBe(100); // июнь 2026
    });

    it('платежи вне диапазона лет в матрицу не попадают', () => {
        const matrix = calculateYearlyMatrix(
            company([
                deal({
                    duration: 24,
                    from: '2024-01-01T00:00:00.000Z',
                    to: '2026-12-31T00:00:00.000Z',
                    sum: '2400',
                }),
            ]),
            new Date(2025, 0, 1),
            new Date(2025, 11, 31),
        );
        expect(matrix).toHaveLength(1);
        // В 2025 попали ровно 12 платежей по 100
        expect(
            matrix[0]?.monthlyTotals.reduce((a, b) => a + b, 0),
        ).toBe(1200);
    });

    it('фильтр по пользователям исключает чужие сделки', () => {
        const matrix = calculateYearlyMatrix(
            company([
                deal({ id: 1, assignedById: '10' }),
                deal({ id: 2, assignedById: '20' }),
            ]),
            new Date(2025, 0, 1),
            new Date(2025, 11, 31),
            ['10'],
        );
        expect(matrix[0]?.monthlyTotals[0]).toBe(100); // одна сделка, не две
    });
});

describe('calculateCompanyStats', () => {
    it('считает суммы, количество и успешность по сделкам периода', () => {
        const stats = calculateCompanyStats(
            company([
                deal({ id: 1, sum: '1200', isWon: true }),
                deal({ id: 2, sum: '600', isWon: false, isInProgress: false }),
                // сделка вне периода — не считается
                deal({
                    id: 3,
                    from: '2020-01-01T00:00:00.000Z',
                    to: '2020-12-31T00:00:00.000Z',
                }),
            ]),
            new Date(2025, 0, 1),
            new Date(2025, 11, 31),
        );

        expect(stats.dealCount).toBe(2);
        expect(stats.periodTotal).toBe(1800);
        expect(stats.successRate).toBe(50);
        // 12 месяцев по (100 + 50)
        expect(stats.averageMonthly).toBe(150);
    });

    it('пустая компания — нулевая статистика без NaN', () => {
        const stats = calculateCompanyStats(
            company([]),
            new Date(2025, 0, 1),
            new Date(2025, 11, 31),
        );
        expect(stats.dealCount).toBe(0);
        expect(stats.periodTotal).toBe(0);
        expect(stats.averageMonthly).toBe(0);
        expect(stats.successRate).toBe(0);
    });
});

describe('buildCompanyTimeline (единый расчёт)', () => {
    it('эквивалентен раздельным calculateCompanyStats + calculateYearlyMatrix', () => {
        const data = company([
            deal({ id: 1, assignedById: '10' }),
            deal({
                id: 2,
                assignedById: '20',
                sum: '2400',
                duration: 24,
                from: '2024-06-01T00:00:00.000Z',
                to: '2026-05-31T00:00:00.000Z',
            }),
        ]);
        const start = new Date(2025, 0, 1);
        const end = new Date(2025, 11, 31);

        const timeline = buildCompanyTimeline(data, start, end);

        expect(timeline.stats).toEqual(
            calculateCompanyStats(data, start, end),
        );
        expect(timeline.yearlyMatrix).toEqual(
            calculateYearlyMatrix(data, start, end),
        );
    });
});

describe('вспомогательные утилиты периода', () => {
    it('getYearsInPeriod перечисляет годы включительно', () => {
        expect(
            getYearsInPeriod(new Date(2024, 5, 1), new Date(2026, 1, 1)),
        ).toEqual([2024, 2025, 2026]);
    });

    it('getMinDateFromDeals находит самую раннюю дату сделки', () => {
        const minDate = getMinDateFromDeals([
            company([
                deal({ from: '2021-03-01T00:00:00.000Z' }),
                deal({ from: '2019-07-01T00:00:00.000Z' }),
            ]),
        ]);
        expect(minDate.getFullYear()).toBe(2019);
    });
});
