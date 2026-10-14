import { describe, expect, it } from 'vitest';
import {
    formatDateTimeShort,
    formatDigestDay,
    hourOfDateTime,
    isFutureIso,
    isTodayIso,
    parseIsoDay,
    shiftIsoDay,
    timeOfDateTime,
    todayIso,
} from '../lib/digest-period.util';

describe('digest-period.util', () => {
    const now = new Date(2026, 9, 14, 12, 0, 0);

    it('todayIso / shiftIsoDay без TZ-сдвигов, через границу месяца', () => {
        expect(todayIso(now)).toBe('2026-10-14');
        expect(shiftIsoDay('2026-10-31', 1)).toBe('2026-11-01');
        expect(shiftIsoDay('2026-03-01', -1)).toBe('2026-02-28');
        expect(parseIsoDay('14.10.2026')).toBeNull();
    });

    it('сегодня/будущее', () => {
        expect(isTodayIso('2026-10-14', now)).toBe(true);
        expect(isFutureIso('2026-10-15', now)).toBe(true);
        expect(isFutureIso('2026-10-13', now)).toBe(false);
    });

    it('подписи дня и времени', () => {
        expect(formatDigestDay('2026-10-14')).toBe('ср, 14 октября 2026');
        expect(hourOfDateTime('2026-10-14 09:05:00')).toBe(9);
        expect(hourOfDateTime(null)).toBeNull();
        expect(timeOfDateTime('2026-10-14 09:05:00')).toBe('09:05');
        expect(formatDateTimeShort('2026-10-16 12:30:00')).toBe('16.10 12:30');
    });
});
