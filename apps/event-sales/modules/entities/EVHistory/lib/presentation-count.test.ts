import { describe, expect, it } from 'vitest';
import { countDonePresentations } from './presentation-count';
import type { EVHistoryRecord } from '../model/history-record.type';

const record = (
    id: number,
    typeCode: string,
    actionCode: string,
): EVHistoryRecord =>
    ({
        id,
        eventType: { code: typeCode, name: typeCode },
        eventAction: { code: actionCode, name: actionCode },
    }) as EVHistoryRecord;

describe('countDonePresentations', () => {
    it('считает только проведённые презентации', () => {
        expect(
            countDonePresentations([
                record(1, 'presentation', 'done'),
                record(2, 'presentation', 'plan'),
                record(3, 'presentation', 'fail'),
                record(4, 'xo', 'done'),
            ]),
        ).toBe(1);
    });

    it('одна запись — одна презентация, сколько бы привязок ни было', () => {
        // Лента приходит по каждой привязке отдельно, id элемента общий:
        // складывать длины лент нельзя — вышло бы три презентации из одной.
        expect(
            countDonePresentations([
                record(7, 'presentation', 'done'),
                record(7, 'presentation', 'done'),
                record(7, 'presentation', 'done'),
            ]),
        ).toBe(1);
    });

    it('истории нет — ноль', () => {
        expect(countDonePresentations([])).toBe(0);
    });
});
