import { describe, expect, it } from 'vitest';
import {
    defaultFeedbackPeriod,
    isIsoDay,
    isValidFeedbackPeriod,
    toIsoDay,
} from './feedback-period.util';

describe('isIsoDay: календарная дата YYYY-MM-DD', () => {
    it('настоящие даты — да, несуществующие и чужой формы — нет', () => {
        expect(isIsoDay('2026-09-29')).toBe(true);
        expect(isIsoDay('2028-02-29')).toBe(true);
        expect(isIsoDay('2026-02-30')).toBe(false);
        expect(isIsoDay('2026-9-1')).toBe(false);
        expect(isIsoDay('')).toBe(false);
        expect(isIsoDay('29.09.2026')).toBe(false);
    });
});

describe('defaultFeedbackPeriod: последние N дней', () => {
    const now = new Date('2026-09-29T21:30:00.000Z');

    it('сегодня включительно, по UTC', () => {
        expect(toIsoDay(now)).toBe('2026-09-29');
        expect(defaultFeedbackPeriod(now, 30)).toEqual({
            from: '2026-08-31',
            to: '2026-09-29',
        });
    });

    it('один день и мусорное окно — хотя бы сегодня', () => {
        expect(defaultFeedbackPeriod(now, 1)).toEqual({
            from: '2026-09-29',
            to: '2026-09-29',
        });
        expect(defaultFeedbackPeriod(now, 0)).toEqual({
            from: '2026-09-29',
            to: '2026-09-29',
        });
    });
});

describe('isValidFeedbackPeriod', () => {
    it('начало не позже конца, обе даты валидны', () => {
        expect(
            isValidFeedbackPeriod({ from: '2026-09-01', to: '2026-09-29' }),
        ).toBe(true);
        expect(
            isValidFeedbackPeriod({ from: '2026-09-29', to: '2026-09-29' }),
        ).toBe(true);
        expect(
            isValidFeedbackPeriod({ from: '2026-09-30', to: '2026-09-29' }),
        ).toBe(false);
        expect(isValidFeedbackPeriod({ from: '', to: '2026-09-29' })).toBe(
            false,
        );
    });
});
