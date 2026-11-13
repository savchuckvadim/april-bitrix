import { describe, expect, it } from 'vitest';
import {
    changeLabel,
    currentMoscowMonth,
    dayLabel,
    minutesLabel,
    monthLabel,
    previousMonthDative,
    rubLabel,
    shiftMonth,
} from './spend-format';

/** toLocaleString('ru-RU') разделяет тысячи неразрывным пробелом. */
const plain = (text: string): string => text.replace(/\s/g, ' ');

describe('форматирование расхода на распознавание', () => {
    it('текущий месяц — по Москве: 31.10 22:00 UTC уже ноябрь', () => {
        expect(currentMoscowMonth(new Date('2026-10-31T22:00:00Z'))).toBe('2026-11');
        expect(currentMoscowMonth(new Date('2026-10-31T20:00:00Z'))).toBe('2026-10');
    });

    it('сдвиг месяца через границу года; кривой месяц не трогается', () => {
        expect(shiftMonth('2026-01', -1)).toBe('2025-12');
        expect(shiftMonth('2026-12', 1)).toBe('2027-01');
        expect(shiftMonth('мусор', 1)).toBe('мусор');
    });

    it('месяц словами и «к прошлому месяцу»', () => {
        expect(monthLabel('2026-11')).toBe('ноябрь 2026');
        expect(previousMonthDative('2026-11')).toBe('к октябрю');
        expect(previousMonthDative('2026-01')).toBe('к декабрю');
    });

    it('рубли: тысячи через пробел, копейки только если есть', () => {
        expect(plain(rubLabel(3198.72))).toBe('3 198,72 ₽');
        expect(plain(rubLabel(36))).toBe('36 ₽');
        expect(plain(rubLabel(0.5))).toBe('0,50 ₽');
    });

    it('минуты: до десяти — с десятыми', () => {
        expect(plain(minutesLabel(5320.4))).toBe('5 320 мин');
        expect(minutesLabel(2.5)).toBe('2,5 мин');
        expect(minutesLabel(3)).toBe('3 мин');
    });

    it('изменение к прошлому месяцу; без прошлого — не с чем сравнить', () => {
        expect(changeLabel(112, 100)).toBe('+12 %');
        expect(changeLabel(60, 100)).toBe('−40 %');
        expect(changeLabel(100, 100)).toBe('как в прошлом месяце');
        expect(changeLabel(50, 0)).toBeNull();
    });

    it('день «дд.мм»', () => {
        expect(dayLabel('2026-11-03')).toBe('03.11');
    });
});
