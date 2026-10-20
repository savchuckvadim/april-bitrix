import { describe, expect, it } from 'vitest';
import {
    closedMonthsOf,
    historyRange,
    lastClosedMonth,
    monthCount,
    reanalysisPeriod,
    todayKey,
} from './launch-period';

const OCT_21 = new Date(2026, 9, 21, 12, 0, 0);
const JAN_05 = new Date(2027, 0, 5, 9, 0, 0);

describe('периоды кнопок панели запуска', () => {
    it('сегодня и прошлый месяц — по локальной дате, через границу года', () => {
        expect(todayKey(OCT_21)).toBe('2026-10-21');
        expect(lastClosedMonth(OCT_21)).toBe('2026-09');
        expect(lastClosedMonth(JAN_05)).toBe('2026-12');
    });

    it('история — ровно 24 закрытых месяца до прошлого включительно', () => {
        const range = historyRange(OCT_21);
        expect(range).toEqual({ from: '2024-10', to: '2026-09' });
        expect(monthCount(range)).toBe(24);
        expect(historyRange(JAN_05)).toEqual({
            from: '2025-01',
            to: '2026-12',
        });
    });

    it('переразбор — с первого дня разборов или с 21.07.2026 по сегодня', () => {
        expect(reanalysisPeriod('2026-08-03', OCT_21)).toEqual({
            from: '2026-08-03',
            to: '2026-10-21',
        });
        expect(reanalysisPeriod(null, OCT_21)).toEqual({
            from: '2026-07-21',
            to: '2026-10-21',
        });
        expect(reanalysisPeriod('мусор', OCT_21).from).toBe('2026-07-21');
        expect(reanalysisPeriod('2026-11-01', OCT_21)).toEqual({
            from: '2026-10-21',
            to: '2026-10-21',
        });
    });

    it('пересборка — закрытые месяцы периода без текущего; нет закрытых — null', () => {
        expect(
            closedMonthsOf({ from: '2026-07-21', to: '2026-10-20' }, OCT_21),
        ).toEqual({
            from: '2026-07',
            to: '2026-09',
        });
        expect(
            closedMonthsOf({ from: '2026-10-01', to: '2026-10-20' }, OCT_21),
        ).toBeNull();
        expect(
            closedMonthsOf({ from: '2026-05-01', to: '2026-06-30' }, OCT_21),
        ).toEqual({
            from: '2026-05',
            to: '2026-06',
        });
    });
});
