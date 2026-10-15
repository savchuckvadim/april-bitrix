import { describe, expect, it } from 'vitest';
import type { DigestEmployee } from '@/modules/entities/digest';
import type { EnabledPlanIndicator } from '@/modules/feature/plans';
import {
    aggregateDigestPlanCells,
    buildDigestPlanRatingBoards,
    buildDigestPlanRows,
    digestPlanCrmPlanned,
    digestPlanFact,
    expectedShareOfDay,
} from '../digest-plan-fact.util';

const count = (byType: Record<string, number> = {}) => ({
    total: Object.values(byType).reduce((sum, value) => sum + value, 0),
    byType,
});

const employee = (userId: number, overrides: Partial<DigestEmployee> = {}): DigestEmployee => ({
    userId,
    name: `Сотр ${userId}`,
    plannedAtStart: count({ xo: 60, call: 40, presentation: 2 }),
    planned: count(),
    plannedBeyond: count(),
    done: count({ xo: 30, call: 20, presentation: 1 }),
    notHeld: count(),
    postponed: count(),
    expired: count(),
    documents: count({ ev_offer: 2, ev_invoice: 1 }),
    sales: 1,
    refusals: 0,
    noresultReasons: {},
    calls: {
        callsCount: 20,
        airtimeSeconds: 1500,
        incoming: { count: 0, seconds: 0 },
        outgoing: { count: 20, seconds: 1500 },
        byDuration: { all: 20, '30': 12, '60': 7 },
        byHour: [],
    },
    records: [],
    plannedAtStartRecords: [],
    ...overrides,
});

const indicator = (
    code: string,
    factKey: string,
    factSource: EnabledPlanIndicator['factSource'] = 'kpi',
): EnabledPlanIndicator =>
    ({
        code,
        unit: 'count',
        factSource,
        factKey,
        defaultName: code,
        displayName: code,
        periodType: 'month',
    }) as EnabledPlanIndicator;

describe('digestPlanFact / digestPlanCrmPlanned', () => {
    const e = employee(42);

    it('kpi: звонки всех подтипов, презентации, документы, продажи', () => {
        expect(digestPlanFact(e, { factSource: 'kpi', factKey: 'call_done' })).toBe(50);
        expect(digestPlanFact(e, { factSource: 'kpi', factKey: 'presentation_done' })).toBe(1);
        expect(digestPlanFact(e, { factSource: 'kpi', factKey: 'ev_offer_act_send' })).toBe(2);
        expect(digestPlanFact(e, { factSource: 'kpi', factKey: 'ev_invoice_act_send' })).toBe(1);
        expect(digestPlanFact(e, { factSource: 'kpi', factKey: 'ev_success_done' })).toBe(1);
    });

    it('calling/airtime из телефонии, finance в дне недоступен', () => {
        expect(digestPlanFact(e, { factSource: 'calling', factKey: '30' })).toBe(12);
        expect(digestPlanFact(e, { factSource: 'airtime', factKey: 'airtimeSeconds' })).toBe(25);
        expect(digestPlanFact(e, { factSource: 'finance', factKey: 'monthlyAmount' })).toBeNull();
        expect(
            digestPlanFact({ ...e, calls: null }, { factSource: 'calling', factKey: '30' }),
        ).toBeNull();
    });

    it('план CRM на день: звонки по всем подтипам, презентации; у документов и продаж его нет', () => {
        expect(digestPlanCrmPlanned(e, { factSource: 'kpi', factKey: 'call_done' })).toBe(100);
        expect(digestPlanCrmPlanned(e, { factSource: 'kpi', factKey: 'presentation_done' })).toBe(2);
        expect(digestPlanCrmPlanned(e, { factSource: 'kpi', factKey: 'ev_offer_act_send' })).toBeNull();
        expect(digestPlanCrmPlanned(e, { factSource: 'kpi', factKey: 'ev_success_done' })).toBeNull();
        expect(digestPlanCrmPlanned(e, { factSource: 'calling', factKey: '30' })).toBeNull();
    });
});

describe('buildDigestPlanRows', () => {
    it('связка: план CRM 100 → план руководителя 80 → факт 50 (62,5% плана, конверсия 50%)', () => {
        const rows = buildDigestPlanRows(
            [employee(42)],
            [indicator('calls_done', 'call_done'), indicator('sales_count', 'ev_success_done')],
            { 42: { calls_done: 2480, sales_count: null } },
            '2026-10-14',
        );
        const row = rows[0]!;
        // 2480 в месяц / 31 день = 80 в день.
        expect(row.cells[0]).toEqual({
            code: 'calls_done',
            plan: 80,
            fact: 50,
            percent: 0.625,
            crmPlanned: 100,
            crmPercent: 0.5,
        });
        expect(row.cells[1]).toEqual({
            code: 'sales_count',
            plan: null,
            fact: 1,
            percent: null,
            crmPlanned: null,
            crmPercent: null,
        });
    });
});

describe('aggregateDigestPlanCells / buildDigestPlanRatingBoards', () => {
    const indicators = [indicator('calls_done', 'call_done')];
    const rows = buildDigestPlanRows(
        [
            employee(1),
            employee(2, { done: count({ xo: 80 }), plannedAtStart: count({ xo: 80 }) }),
            employee(3),
        ],
        indicators,
        { 1: { calls_done: 2480 }, 2: { calls_done: 2480 }, 3: {} },
        '2026-10-14',
    );

    it('итого: Σ планов только заданных, Σ плана CRM, Σ фактов, доли из сумм', () => {
        const [total] = aggregateDigestPlanCells(indicators, rows);
        expect(total).toEqual({
            code: 'calls_done',
            plan: 160,
            fact: 180,
            percent: 180 / 160,
            crmPlanned: 280,
            crmPercent: 180 / 280,
        });
    });

    it('рейтинг достигаемости: только с планом, по убыванию %', () => {
        const [board] = buildDigestPlanRatingBoards(indicators, rows);
        expect(board!.participants).toBe(2);
        expect(board!.entries.map(entry => [entry.userId, entry.rank, entry.percent])).toEqual([
            [2, 1, 1],
            [1, 2, 0.625],
        ]);
    });
});

describe('expectedShareOfDay', () => {
    it('прошлый день — 1, будущий — 0, сегодня — доля окна 9–18', () => {
        const now = new Date(2026, 9, 14, 13, 30);
        expect(expectedShareOfDay('2026-10-13', now)).toBe(1);
        expect(expectedShareOfDay('2026-10-15', now)).toBe(0);
        expect(expectedShareOfDay('2026-10-14', now)).toBeCloseTo(0.5);
        expect(expectedShareOfDay('2026-10-14', new Date(2026, 9, 14, 7, 0))).toBe(0);
        expect(expectedShareOfDay('2026-10-14', new Date(2026, 9, 14, 21, 0))).toBe(1);
    });
});
