import { describe, expect, it } from 'vitest';
import type { StructureSection } from '@/modules/entities/department';
import type { DigestCalls, DigestEmployee, DigestSummary } from '../model';
import {
    averageOfSummary,
    buildDigestAverages,
    buildDigestRatingDataset,
    buildDigestRows,
    compareToAverages,
    metricValuesOf,
    rankByMetric,
    sumRows,
} from '../lib/digest-metrics.util';

const count = (byType: Record<string, number> = {}) => ({
    total: Object.values(byType).reduce((sum, value) => sum + value, 0),
    byType,
});

const calls = (callsCount: number, seconds: number): DigestCalls => ({
    callsCount,
    airtimeSeconds: seconds,
    incoming: { count: 0, seconds: 0 },
    outgoing: { count: callsCount, seconds },
    byDuration: { all: callsCount },
    byHour: [],
});

const employee = (
    userId: number,
    overrides: Partial<DigestEmployee> = {},
): DigestEmployee => ({
    userId,
    name: `Сотр ${userId}`,
    plannedAtStart: count(),
    planned: count(),
    plannedBeyond: count(),
    done: count(),
    notHeld: count(),
    postponed: count(),
    expired: count(),
    documents: count(),
    sales: 0,
    refusals: 0,
    noresultReasons: {},
    calls: null,
    records: [],
    plannedAtStartRecords: [],
    ...overrides,
});

const fixture = (): DigestEmployee[] => [
    employee(1, {
        plannedAtStart: count({ xo: 4 }),
        done: count({ xo: 3, presentation: 1 }),
        notHeld: count({ xo: 1 }),
        postponed: count({ presentation: 1 }),
        sales: 1,
        calls: calls(20, 1800),
    }),
    employee(2, {
        plannedAtStart: count({ xo: 2 }),
        done: count({ xo: 1 }),
        notHeld: count({ xo: 3 }),
        calls: calls(10, 600),
    }),
    employee(3, { done: count({ xo: 1 }) }),
];

describe('metricValuesOf / buildDigestRows', () => {
    it('считает отработано, результативность и выполнение плана дня', () => {
        const row = buildDigestRows(fixture())[0]!;
        expect(row.values.worked).toBe(6);
        expect(row.values.done).toBe(4);
        expect(row.values.resultRate).toBeCloseTo(4 / 6);
        expect(row.values.planCompletion).toBeCloseTo(6 / 4);
        expect(row.values.callsCount).toBe(20);
        expect(row.values.airtimeMinutes).toBe(30);
    });

    it('без базы доли null, без телефонии звонки null', () => {
        const third = buildDigestRows(fixture())[2]!;
        expect(third.values.resultRate).toBe(1);
        expect(third.values.planCompletion).toBeNull();
        expect(third.values.callsCount).toBeNull();
        expect(metricValuesOf(employee(9), null).resultRate).toBeNull();
    });
});

describe('sumRows', () => {
    it('складывает счётчики, доли берёт из сумм, звонки — только где есть', () => {
        const total = sumRows(buildDigestRows(fixture()));
        expect(total.done).toBe(6);
        expect(total.worked).toBe(11);
        expect(total.resultRate).toBeCloseTo(6 / 11);
        expect(total.planCompletion).toBeCloseTo(11 / 6);
        expect(total.callsCount).toBe(30);
        expect(total.airtimeMinutes).toBe(40);
    });
});

describe('rankByMetric', () => {
    it('убывание, ничьи делят место', () => {
        const rows = buildDigestRows(fixture());
        const rank = rankByMetric(rows, 'done');
        expect(rank.map(entry => [entry.userId, entry.rank])).toEqual([
            [1, 1],
            [2, 2],
            [3, 2],
        ]);
    });

    it('результативность — только при базе ≥ 3 отработанных', () => {
        const rank = rankByMetric(buildDigestRows(fixture()), 'resultRate');
        expect(rank.map(entry => entry.userId)).toEqual([1, 2]);
    });

    it('план дня — без базы не участвует; без телефонии — вне рейтинга звонков', () => {
        const rows = buildDigestRows(fixture());
        // 4/2 = 200% у второго против 6/4 = 150% у первого; третий без плана.
        expect(rankByMetric(rows, 'planCompletion').map(e => e.userId)).toEqual([2, 1]);
        expect(rankByMetric(rows, 'callsCount').map(e => e.userId)).toEqual([1, 2]);
    });
});

describe('buildDigestRatingDataset', () => {
    it('проценты в 0..100, null → 0', () => {
        const dataset = buildDigestRatingDataset(buildDigestRows(fixture()), [
            'done',
            'resultRate',
            'callsCount',
        ]);
        expect(dataset.actions.map(a => a.code)).toEqual(['done', 'resultRate', 'callsCount']);
        expect(dataset.rows[0]!.values).toEqual({ done: 4, resultRate: 67, callsCount: 20 });
        expect(dataset.rows[2]!.values.callsCount).toBe(0);
    });
});

describe('averages', () => {
    const sections: StructureSection[] = [
        { id: 'dep-1', name: 'Отдел 1', userIds: [1, 2] },
        { id: 'dep-2', name: 'Отдел 2', userIds: [3] },
    ];
    const summary: DigestSummary = {
        usersCount: 4,
        totals: {
            ...employee(0),
            done: count({ xo: 8 }),
            notHeld: count({ xo: 2 }),
            sales: 2,
        },
        calls: calls(40, 2400),
        callsUsersCount: 2,
    };

    it('Ø по отделу и по всем: счётчики на сотрудника, доли из сумм, звонки — по тем, у кого есть', () => {
        const rows = buildDigestRows(fixture());
        const averages = buildDigestAverages(rows, sections, summary);
        const dept = averages.bySection['dep-1']!;
        expect(dept.done).toBe(2.5);
        expect(dept.resultRate).toBeCloseTo(5 / 10);
        expect(dept.callsCount).toBe(15);
        expect(averages.selection.done).toBe(2);
        expect(averages.selection.callsCount).toBe(15);
        expect(averages.all?.done).toBe(2);
        expect(averages.all?.resultRate).toBeCloseTo(0.8);
        expect(averages.all?.callsCount).toBe(20);
        expect(averageOfSummary({ ...summary, calls: null }).callsCount).toBeNull();
    });

    it('сравнение сотрудника со средними отдела и всех', () => {
        const rows = buildDigestRows(fixture());
        const averages = buildDigestAverages(rows, sections, summary);
        const items = compareToAverages(rows[0]!, averages, sections, [
            'done',
            'resultRate',
        ]);
        const done = items[0]!;
        const rate = items[1]!;
        expect(done.value).toBe(4);
        expect(done.dept).toBe(2.5);
        expect(done.deltaDeptPct).toBeCloseTo(60);
        expect(done.all).toBe(2);
        expect(done.deltaAllPct).toBeCloseTo(100);
        expect(rate.deltaAllPct).toBeCloseTo(((4 / 6 - 0.8) / 0.8) * 100);
    });
});
