import { describe, expect, it } from 'vitest';
import {
    AI_MATRIX_NORM_DELTA,
    AI_MATRIX_SCORE_MAX,
    AI_MATRIX_TEXT,
} from '../lib/ai-matrix.texts';

/* Правило владельца: по-русски, без кодов, формул, стрелок, «админки» и «периметра». */
const FORBIDDEN = /[→×≥≤σκβ↑↓]|n ?=|админк|значимо|рычаг|вилк|в тени|периметр|мало данных/i;

const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === 'object') {
        return Object.values(value).flatMap(flatten);
    }
    return [];
};

describe('AI_MATRIX_TEXT — тексты ячеек матриц', () => {
    it('константы: шкала 10, порог «выше/ниже среднего» 0,5 балла', () => {
        expect(AI_MATRIX_SCORE_MAX).toBe(10);
        expect(AI_MATRIX_NORM_DELTA).toBe(0.5);
    });

    it('«ещё N» и «по N звонкам» склоняются; «из 10» у итога', () => {
        expect(AI_MATRIX_TEXT.remaining(4)).toBe('ещё 4');
        expect(AI_MATRIX_TEXT.byCalls(1)).toBe('по 1 звонку');
        expect(AI_MATRIX_TEXT.byCalls(18)).toBe('по 18 звонкам');
        expect(AI_MATRIX_TEXT.managers(3)).toBe('3 сотр.');
        expect(AI_MATRIX_TEXT.scoreOutOf(6.84)).toBe('6,8 из 10');
        expect(AI_MATRIX_TEXT.csv.remaining(4)).toBe('ещё 4 до оценки');
    });

    it('подсказка при нехватке разборов: порог, причина, что сделать с датой и без', () => {
        const withDate = AI_MATRIX_TEXT.hint.fewData(4, 8, '2026-09-25');
        expect(withDate).toContain('Разобрано 4 звонка этого вида');
        expect(withDate).toContain('Оценку показываем от 8');
        expect(withDate).toContain('Что сделать: выберите период длиннее (но не раньше 25.09.2026)');
        expect(AI_MATRIX_TEXT.hint.fewData(1, 8, null)).toContain(
            'Что сделать: выберите период длиннее.',
        );
        expect(AI_MATRIX_TEXT.hint.low(20)).toContain('Меньше 20 разборов');
        expect(AI_MATRIX_TEXT.hint.norm.above(6.8)).toBe(
            'Выше среднего по отделу (6,8).',
        );
    });

    it('все тексты — по-русски, без стрелок, формул, «админки» и «мало данных»', () => {
        const texts = [
            ...flatten(AI_MATRIX_TEXT),
            AI_MATRIX_TEXT.hint.fewData(4, 8, '2026-09-25'),
            AI_MATRIX_TEXT.hint.low(20),
            AI_MATRIX_TEXT.hint.noCellScores(8),
            AI_MATRIX_TEXT.hint.noPartScores(8),
            AI_MATRIX_TEXT.hint.norm.below(5.5),
            AI_MATRIX_TEXT.hint.norm.near(6),
        ];
        expect(texts.length).toBeGreaterThan(10);
        for (const text of texts) expect(text).not.toMatch(FORBIDDEN);
    });
});
