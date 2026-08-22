import { describe, expect, it } from 'vitest';
import { getSlaCountdown, parseAssignedAt } from './sla-countdown';

describe('parseAssignedAt', () => {
    it('понимает ISO и CRM-формат портала', () => {
        expect(parseAssignedAt('2026-08-14T10:00:00+03:00')).not.toBeNull();
        expect(parseAssignedAt('14.08.2026 10:00:00')).toBe(
            new Date(2026, 7, 14, 10, 0, 0).getTime(),
        );
        expect(parseAssignedAt('14.08.2026 10:05')).toBe(
            new Date(2026, 7, 14, 10, 5, 0).getTime(),
        );
    });

    it('непонятное — null, таймер не врёт', () => {
        expect(parseAssignedAt('')).toBeNull();
        expect(parseAssignedAt('вчера')).toBeNull();
        expect(parseAssignedAt(null)).toBeNull();
        expect(parseAssignedAt(42)).toBeNull();
    });
});

describe('getSlaCountdown', () => {
    const assigned = new Date(2026, 7, 14, 10, 0, 0).getTime();

    it('считает остаток до часа', () => {
        const now = new Date(2026, 7, 14, 10, 25, 0).getTime();
        expect(getSlaCountdown(assigned, now)).toEqual({
            minutesLeft: 35,
            isOverdue: false,
        });
    });

    it('срок вышел — ноль и просрочка, отрицательных минут нет', () => {
        const now = new Date(2026, 7, 14, 11, 30, 0).getTime();
        expect(getSlaCountdown(assigned, now)).toEqual({
            minutesLeft: 0,
            isOverdue: true,
        });
    });
});

describe('parseAssignedAt: дни 1–12 не путаются с месяцем', () => {
    it('CRM-формат читается как ДД.ММ, а не как ММ.ДД', () => {
        // Date.parse('05.08.2026 …') в V8 отдаёт 8 мая — CRM-ветка обязана
        // сработать раньше и вернуть 5 августа.
        expect(parseAssignedAt('05.08.2026 14:30:00')).toBe(
            new Date(2026, 7, 5, 14, 30, 0).getTime(),
        );
        expect(parseAssignedAt('01.12.2026 09:00')).toBe(
            new Date(2026, 11, 1, 9, 0, 0).getTime(),
        );
    });
});
