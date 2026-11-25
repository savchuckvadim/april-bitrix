import { describe, expect, it } from 'vitest';
import { formatCalculatedAt } from '../format-calculated-at.util';

/*
 * Время расчёта — в поясе браузера. Даты строим из локальных частей и
 * переводим в ISO, поэтому ожидание не зависит от пояса, в котором идут тесты.
 */

const iso = (
    month: number,
    day: number,
    hour: number,
    minute: number,
): string => new Date(2026, month - 1, day, hour, minute).toISOString();

describe('formatCalculatedAt', () => {
    it('формат «ДД.ММ в ЧЧ:ММ»', () => {
        expect(formatCalculatedAt(iso(11, 12, 10, 40))).toBe('12.11 в 10:40');
    });

    it('день и месяц с ведущим нулём', () => {
        expect(formatCalculatedAt(iso(3, 5, 9, 7))).toBe('05.03 в 09:07');
    });

    it('полночь и конец суток: 24-часовой формат', () => {
        expect(formatCalculatedAt(iso(12, 1, 0, 0))).toBe('01.12 в 00:00');
        expect(formatCalculatedAt(iso(12, 31, 23, 59))).toBe('31.12 в 23:59');
    });

    it('строка в UTC показывается временем браузера', () => {
        const date = new Date(2026, 10, 12, 10, 40);
        expect(formatCalculatedAt(date.toISOString())).toBe('12.11 в 10:40');
    });

    it('некорректная строка и пустая строка: пусто', () => {
        expect(formatCalculatedAt('не дата')).toBe('');
        expect(formatCalculatedAt('')).toBe('');
    });
});
