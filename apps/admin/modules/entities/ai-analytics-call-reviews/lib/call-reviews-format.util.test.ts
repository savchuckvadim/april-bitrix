import { describe, expect, it } from 'vitest';
import {
    commentPreview,
    countWithPct,
    formatDiff,
    formatMoscowDateTime,
    formatScore,
    managerLabel,
    scoreChangeLabel,
} from './call-reviews-format.util';

describe('форматирование строк отзывов', () => {
    it('оценка: целая без дроби, дробная — запятая, нет — прочерк', () => {
        expect(formatScore(7)).toBe('7');
        expect(formatScore(7.25)).toBe('7,3');
        expect(formatScore(null)).toBe('—');
        expect(scoreChangeLabel(7.2, 5)).toBe('AI 7,2 → 5');
        expect(scoreChangeLabel(null, null)).toBe('AI — → —');
    });

    it('разница со знаком и доля в скобках', () => {
        expect(formatDiff(-1.2)).toBe('−1,2');
        expect(formatDiff(0.5)).toBe('+0,5');
        expect(formatDiff(0)).toBe('0');
        expect(formatDiff(null)).toBe('—');
        expect(countWithPct(9, 39.1)).toBe('9 (39,1 %)');
        expect(countWithPct(0, null)).toBe('0');
    });

    it('дата и время — по Москве', () => {
        expect(formatMoscowDateTime('2026-11-18T12:41:00.000Z')).toBe('18.11.2026, 15:41');
        expect(formatMoscowDateTime(null)).toBe('—');
        expect(formatMoscowDateTime('не дата')).toBe('—');
    });

    it('комментарий: до 300 знаков целиком, длиннее — начало с «…» и признак обрезки', () => {
        expect(commentPreview('  коротко  ', 300)).toEqual({ text: 'коротко', truncated: false });
        const long = commentPreview('а'.repeat(301), 300);
        expect(long.truncated).toBe(true);
        expect(long.text).toBe(`${'а'.repeat(300)}…`);
        expect(commentPreview('а'.repeat(300), 300).truncated).toBe(false);
    });

    it('менеджер: имя, иначе номер сотрудника, иначе прочерк', () => {
        expect(managerLabel('Иванова Мария', '447')).toBe('Иванова Мария');
        expect(managerLabel(null, '447')).toBe('сотрудник 447');
        expect(managerLabel('  ', null)).toBe('—');
    });
});
