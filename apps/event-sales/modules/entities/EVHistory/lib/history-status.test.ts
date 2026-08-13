import { describe, expect, it } from 'vitest';
import { getHistoryStatus } from './history-status';
import type { EVHistoryRecord } from '../model/history-record.type';

const NOW = new Date('2026-08-13T12:00:00Z').getTime();
const YESTERDAY = new Date('2026-08-12T12:00:00Z').getTime();
const TOMORROW = new Date('2026-08-14T12:00:00Z').getTime();

const record = (
    raw: Partial<
        Pick<EVHistoryRecord, 'resultStatus' | 'eventAction' | 'dateTs'>
    >,
) =>
    ({
        resultStatus: null,
        eventAction: null,
        dateTs: null,
        ...raw,
    }) as EVHistoryRecord;

describe('getHistoryStatus', () => {
    it('результативное — состоялось', () => {
        expect(
            getHistoryStatus(
                record({
                    resultStatus: { code: 'result_done', name: 'Проведено' },
                }),
                NOW,
            ).kind,
        ).toBe('done');
    });

    it('нерезультативное — не состоялось', () => {
        expect(
            getHistoryStatus(
                record({
                    resultStatus: { code: 'noresult', name: 'Недозвон' },
                }),
                NOW,
            ).kind,
        ).toBe('failed');
    });

    it('запланированное в прошлом — просрочено, в будущем — ждёт', () => {
        expect(
            getHistoryStatus(
                record({
                    eventAction: { code: 'plan', name: 'Запланировано' },
                    dateTs: YESTERDAY,
                }),
                NOW,
            ).kind,
        ).toBe('overdue');
        expect(
            getHistoryStatus(
                record({
                    eventAction: { code: 'plan', name: 'Запланировано' },
                    dateTs: TOMORROW,
                }),
                NOW,
            ).kind,
        ).toBe('planned');
    });

    it('исход неизвестен — не выдумываем', () => {
        expect(getHistoryStatus(record({}), NOW).kind).toBe('unknown');
    });
});
