import { describe, expect, it } from 'vitest';
import {
    AI_MATRIX_TONE_CLASS,
    aiMatrixNormHint,
    aiMatrixTone,
    aiWeightedScore,
    roundAiScore,
} from '../lib/ai-matrix-norm.util';

describe('aiMatrixTone — выше / ниже / около среднего по отделу', () => {
    it('порог 0,5 балла: ровно на границе — около', () => {
        expect(aiMatrixTone(7.4, 6.8)).toBe('above');
        expect(aiMatrixTone(7.3, 6.8)).toBe('near');
        expect(aiMatrixTone(6.2, 6.8)).toBe('below');
        expect(aiMatrixTone(6.3, 6.8)).toBe('near');
    });

    it('без оценки или нормы — null; свой порог', () => {
        expect(aiMatrixTone(null, 6.8)).toBeNull();
        expect(aiMatrixTone(7, null)).toBeNull();
        expect(aiMatrixTone(7, undefined)).toBeNull();
        expect(aiMatrixTone(7.3, 6.8, 0.2)).toBe('above');
    });

    it('классы тона: выше — success, ниже — destructive, около — без класса', () => {
        expect(AI_MATRIX_TONE_CLASS.above).toBe('text-success');
        expect(AI_MATRIX_TONE_CLASS.below).toBe('text-destructive');
        expect(AI_MATRIX_TONE_CLASS.near).toBe('');
    });

    it('подсказка по тону с нормой; без тона — null', () => {
        expect(aiMatrixNormHint('below', 6.84)).toBe(
            'Ниже среднего по отделу (6,8).',
        );
        expect(aiMatrixNormHint(null, 6.8)).toBeNull();
        expect(aiMatrixNormHint('above', null)).toBeNull();
    });
});

describe('aiWeightedScore — взвешенное по n среднее', () => {
    it('8 (n = 2) и 5 (n = 6) → 5,8; n суммируется по всем точкам', () => {
        expect(
            aiWeightedScore([
                { score: 8, n: 2 },
                { score: 5, n: 6 },
            ]),
        ).toEqual({ n: 8, scoredN: 8, score: 5.8 });
    });

    it('точки без оценки входят в объём, но не в среднее; n ≤ 0 не учитываются', () => {
        expect(
            aiWeightedScore([
                { score: 7, n: 10 },
                { score: null, n: 5 },
                { score: 9, n: 0 },
            ]),
        ).toEqual({ n: 15, scoredN: 10, score: 7 });
    });

    it('ни одной оценки — score null; пусто — нули', () => {
        expect(aiWeightedScore([{ score: null, n: 4 }])).toEqual({
            n: 4,
            scoredN: 0,
            score: null,
        });
        expect(aiWeightedScore([])).toEqual({ n: 0, scoredN: 0, score: null });
        expect(roundAiScore(5.75)).toBe(5.8);
    });
});
