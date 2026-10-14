import { describe, expect, it } from 'vitest';
import type { DigestCalls, DigestRecord } from '../model';
import {
    bucketCallsByHour,
    bucketPlannedByHour,
    bucketRecordsByHour,
    stackOfRecord,
    visibleHourRange,
} from '../lib/digest-timeline.util';

const record = (overrides: Partial<DigestRecord>): DigestRecord => ({
    id: '1',
    userId: 1,
    typeCode: 'xo',
    typeName: null,
    actionCode: 'done',
    actionName: null,
    eventDate: '2026-10-14 10:15:00',
    planDate: null,
    resultCode: null,
    noresultReason: null,
    comment: '',
    name: '',
    crmRefs: [],
    companyId: null,
    ...overrides,
});

describe('stackOfRecord', () => {
    it('исход по действию и типу', () => {
        expect(stackOfRecord(record({ actionCode: 'done' }))).toBe('done');
        expect(stackOfRecord(record({ actionCode: 'act_noresult_fail' }))).toBe('notHeld');
        expect(stackOfRecord(record({ actionCode: 'pound' }))).toBe('postponed');
        expect(stackOfRecord(record({ actionCode: 'plan' }))).toBe('planned');
        expect(stackOfRecord(record({ typeCode: 'ev_success', actionCode: 'done' }))).toBe('sales');
        expect(stackOfRecord(record({ typeCode: 'ev_fail', actionCode: 'done' }))).toBe('refusals');
        expect(stackOfRecord(record({ typeCode: 'ev_offer', actionCode: 'act_send' }))).toBe('documents');
        expect(stackOfRecord(record({ typeCode: 'ev_offer', actionCode: 'done' }))).toBeNull();
        expect(stackOfRecord(record({ actionCode: 'act_sign' }))).toBeNull();
    });
});

describe('bucketRecordsByHour / bucketPlannedByHour', () => {
    it('раскладывает по часу события и дедлайна', () => {
        const events = bucketRecordsByHour([
            record({ eventDate: '2026-10-14 10:15:00' }),
            record({ eventDate: '2026-10-14 10:45:00', actionCode: 'act_noresult_fail' }),
            record({ eventDate: '2026-10-14 17:05:00' }),
            record({ eventDate: null }),
        ]);
        expect(events).toHaveLength(24);
        expect(events[10]!.values).toEqual({ done: 1, notHeld: 1 });
        expect(events[17]!.values).toEqual({ done: 1 });

        const planned = bucketPlannedByHour([
            record({ planDate: '2026-10-14 09:00:00', typeCode: 'xo' }),
            record({ planDate: '2026-10-14 09:30:00', typeCode: 'presentation' }),
            record({ planDate: '2026-10-14 14:00:00', typeCode: 'info' }),
        ]);
        expect(planned[9]!.values).toEqual({ calls: 1, presentations: 1 });
        expect(planned[14]!.values).toEqual({ other: 1 });
    });
});

describe('bucketCallsByHour', () => {
    it('суммирует корзины сотрудников, минуты с одним знаком', () => {
        const cell = (hour: number, calls: number, seconds: number): DigestCalls => ({
            callsCount: calls,
            airtimeSeconds: seconds,
            incoming: { count: 0, seconds: 0 },
            outgoing: { count: 0, seconds: 0 },
            byDuration: {},
            byHour: [{ hour, calls, seconds }],
        });
        const buckets = bucketCallsByHour([cell(11, 2, 90), cell(11, 1, 30), null]);
        expect(buckets[11]!.values).toEqual({ calls: 3, minutes: 2 });
    });
});

describe('visibleHourRange', () => {
    it('базовый диапазон расширяется до часов с данными', () => {
        const empty = bucketRecordsByHour([]);
        expect(visibleHourRange([empty])).toEqual({ from: 8, to: 20 });
        const late = bucketRecordsByHour([record({ eventDate: '2026-10-14 22:10:00' })]);
        const early = bucketRecordsByHour([record({ eventDate: '2026-10-14 06:10:00' })]);
        expect(visibleHourRange([late, early])).toEqual({ from: 6, to: 22 });
    });
});
