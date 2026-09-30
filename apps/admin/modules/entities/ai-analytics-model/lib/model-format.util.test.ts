import { describe, expect, it } from 'vitest';
import { plain } from './plain-text.test-helper';
import {
    NO_VALUE,
    formatCount,
    formatDateTime,
    formatDay,
    formatDecimal,
    formatMonthKey,
    formatOutOf,
    formatPercent,
    formatRange,
    formatShare,
    formatSigned,
    formatWithRange,
    pluralRu,
} from './model-format.util';

describe('formatCount / formatDecimal: числа по-русски', () => {
    it('разряды и запятая', () => {
        expect(plain(formatCount(12345))).toBe('12 345');
        expect(formatCount(7.6)).toBe('8');
        expect(formatDecimal(0.4213)).toBe('0,42');
        expect(formatDecimal(12.5, 1)).toBe('12,5');
    });

    it('null и нечисло — прочерк, а ноль остаётся нулём', () => {
        expect(formatCount(null)).toBe(NO_VALUE);
        expect(formatCount(undefined)).toBe(NO_VALUE);
        expect(formatDecimal(Number.NaN)).toBe(NO_VALUE);
        expect(formatDecimal(0)).toBe('0,00');
        expect(formatCount(0)).toBe('0');
    });
});

describe('formatShare / formatPercent: проценты', () => {
    it('доля 0–1 умножается на сто, проценты — как есть', () => {
        expect(plain(formatShare(0.873))).toBe('87 %');
        expect(plain(formatShare(0.8734, 1))).toBe('87,3 %');
        expect(plain(formatPercent(62.5))).toBe('62,5 %');
        expect(plain(formatShare(0))).toBe('0 %');
    });

    it('null — прочерк', () => {
        expect(formatShare(null)).toBe(NO_VALUE);
        expect(formatPercent(null)).toBe(NO_VALUE);
    });
});

describe('formatSigned: разность со знаком', () => {
    it('плюс, минус и ноль без знака', () => {
        expect(formatSigned(0.05)).toBe('+0,05');
        expect(formatSigned(-0.031)).toBe('−0,03');
        expect(formatSigned(0)).toBe('0,00');
        expect(formatSigned(0.001)).toBe('0,00');
        expect(formatSigned(-0.004)).toBe('0,00');
        expect(formatSigned(null)).toBe(NO_VALUE);
    });
});

describe('formatRange / formatWithRange: интервалы', () => {
    const two = (value: number) => formatDecimal(value);

    it('интервал из двух чисел', () => {
        expect(formatRange([0.12, 0.48], two)).toBe('0,12 – 0,48');
        expect(formatWithRange(0.31, [0.12, 0.48], two)).toBe(
            '0,31 (0,12 – 0,48)',
        );
    });

    it('кривой или пустой интервал — прочерк, оценка остаётся', () => {
        expect(formatRange(null, two)).toBe(NO_VALUE);
        expect(formatRange([0.1], two)).toBe(NO_VALUE);
        expect(formatRange([0.1, Number.NaN], two)).toBe(NO_VALUE);
        expect(formatWithRange(0.31, null, two)).toBe('0,31');
        expect(formatWithRange(null, [0.1, 0.2], two)).toBe(NO_VALUE);
    });
});

describe('даты и месяцы', () => {
    it('ключ месяца → название', () => {
        expect(formatMonthKey('2026-09')).toBe('сентябрь 2026');
        expect(formatMonthKey('2026-13')).toBe('2026-13');
        expect(formatMonthKey('сентябрь')).toBe('сентябрь');
    });

    it('день YYYY-MM-DD → ДД.ММ.ГГГГ', () => {
        expect(formatDay('2026-09-01')).toBe('01.09.2026');
        expect(formatDay('01.09.2026')).toBe('01.09.2026');
    });

    it('момент: пусто — прочерк, мусор — как есть', () => {
        expect(formatDateTime(null)).toBe(NO_VALUE);
        expect(formatDateTime('')).toBe(NO_VALUE);
        expect(formatDateTime('не дата')).toBe('не дата');
        expect(formatDateTime('2026-09-01T10:00:00.000Z')).toMatch(/2026/);
    });
});

describe('formatOutOf / pluralRu', () => {
    it('«N из M» и формы слова', () => {
        expect(formatOutOf(2, 3)).toBe('2 из 3');
        const forms = ['месяц', 'месяца', 'месяцев'] as const;
        expect(pluralRu(1, forms)).toBe('месяц');
        expect(pluralRu(3, forms)).toBe('месяца');
        expect(pluralRu(5, forms)).toBe('месяцев');
        expect(pluralRu(11, forms)).toBe('месяцев');
        expect(pluralRu(21, forms)).toBe('месяц');
        expect(pluralRu(0, forms)).toBe('месяцев');
    });
});
