import { describe, expect, it } from 'vitest';
import type { DigestEmployee } from '@/modules/entities/digest';
import {
    buildDigestPlanRows,
    digestPlanFact,
    expectedShareOfDay,
} from '../digest-plan-fact.util';

const count = (byType: Record<string, number> = {}) => ({
    total: Object.values(byType).reduce((sum, value) => sum + value, 0),
    byType,
});

const employee: DigestEmployee = {
    userId: 42,
    name: 'Иван',
    plannedAtStart: count(),
    planned: count(),
    plannedBeyond: count(),
    done: count({ xo: 3, call: 2, presentation: 1 }),
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
};

describe('digestPlanFact', () => {
    it('kpi: звонки всех подтипов, презентации, документы, продажи', () => {
        expect(digestPlanFact(employee, { factSource: 'kpi', factKey: 'call_done' })).toBe(5);
        expect(digestPlanFact(employee, { factSource: 'kpi', factKey: 'presentation_done' })).toBe(1);
        expect(digestPlanFact(employee, { factSource: 'kpi', factKey: 'ev_offer_act_send' })).toBe(2);
        expect(digestPlanFact(employee, { factSource: 'kpi', factKey: 'ev_invoice_act_send' })).toBe(1);
        expect(digestPlanFact(employee, { factSource: 'kpi', factKey: 'ev_success_done' })).toBe(1);
    });

    it('calling/airtime из телефонии, finance в дне недоступен', () => {
        expect(digestPlanFact(employee, { factSource: 'calling', factKey: '30' })).toBe(12);
        expect(digestPlanFact(employee, { factSource: 'airtime', factKey: 'airtimeSeconds' })).toBe(25);
        expect(digestPlanFact(employee, { factSource: 'finance', factKey: 'monthlyAmount' })).toBeNull();
        expect(
            digestPlanFact({ ...employee, calls: null }, { factSource: 'calling', factKey: '30' }),
        ).toBeNull();
    });
});

describe('buildDigestPlanRows', () => {
    it('план на день = месячная цель / дней в месяце; без цели — null', () => {
        const rows = buildDigestPlanRows(
            [employee],
            [
                {
                    code: 'calls_done',
                    unit: 'count',
                    factSource: 'kpi',
                    factKey: 'call_done',
                    defaultName: 'Звонки',
                    displayName: 'Звонки',
                    periodType: 'month',
                },
                {
                    code: 'sales_count',
                    unit: 'count',
                    factSource: 'kpi',
                    factKey: 'ev_success_done',
                    defaultName: 'Продажи',
                    displayName: 'Продажи',
                    periodType: 'month',
                },
            ] as never,
            { 42: { calls_done: 310, sales_count: null } },
            '2026-10-14',
        );
        const row = rows[0]!;
        expect(row.cells[0]).toEqual({ code: 'calls_done', plan: 10, fact: 5, percent: 0.5 });
        expect(row.cells[1]).toEqual({ code: 'sales_count', plan: null, fact: 1, percent: null });
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
