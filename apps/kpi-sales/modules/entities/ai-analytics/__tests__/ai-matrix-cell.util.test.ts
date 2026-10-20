import { describe, expect, it } from 'vitest';
import {
    aiMatrixLevel,
    presentAiScoreCell,
} from '../lib/ai-matrix-cell.util';
import { AI_MATRIX_TEXT } from '../lib/ai-matrix.texts';

describe('aiMatrixLevel — уровень доверия по объёму', () => {
    it('по умолчанию: меньше 8 — none, 8–19 — low, от 20 — ok; свои пороги', () => {
        expect(aiMatrixLevel(7)).toBe('none');
        expect(aiMatrixLevel(8)).toBe('low');
        expect(aiMatrixLevel(19)).toBe('low');
        expect(aiMatrixLevel(20)).toBe('ok');
        expect(aiMatrixLevel(10, { none: 5, lowScore: 12 })).toBe('low');
        expect(aiMatrixLevel(12, { none: 5, lowScore: 12 })).toBe('ok');
    });
});

describe('presentAiScoreCell — крупно оценка, мелко объём', () => {
    it('без звонков — прочерк, value 0, без аннотации и подсказки', () => {
        expect(presentAiScoreCell({ n: 0, score: null })).toEqual({
            action: { value: 0, display: '—' },
            annotation: null,
        });
    });

    it('меньше 8 разборов: «ещё K», подстрока «до оценки · по N звонкам», подсказка с датой', () => {
        const cell = presentAiScoreCell(
            { n: 4, score: null },
            { comparableFrom: '2026-09-25' },
        );
        expect(cell.action).toEqual({
            value: 4,
            display: 'ещё 4',
            tooltip: AI_MATRIX_TEXT.hint.fewData(4, 8, '2026-09-25'),
        });
        expect(cell.annotation).toEqual({
            text: 'до оценки · по 4 звонкам',
            score: null,
            n: 4,
            remaining: 4,
        });
    });

    it('8–19 разборов: оценка с пометкой «предварительно», без цвета даже при норме', () => {
        const cell = presentAiScoreCell(
            { n: 12, score: 6.4, explanation: 'Оценка 6,4 из 10 по 12 разборам.' },
            { norm: 5 },
        );
        expect(cell.action.display).toBe('6,4');
        expect(cell.action.className).toBeUndefined();
        expect(cell.action.tooltip).toBe(
            `Оценка 6,4 из 10 по 12 разборам.\n${AI_MATRIX_TEXT.hint.low(20)}`,
        );
        expect(cell.annotation).toEqual({
            text: 'предварительно · по 12 звонкам',
            score: 6.4,
            n: 12,
            remaining: 0,
        });
    });

    it('от 20 разборов: цвет относительно нормы; без текста бэка — подсказка «выше/ниже среднего»', () => {
        const above = presentAiScoreCell({ n: 24, score: 7.6 }, { norm: 6.8 });
        expect(above.action).toEqual({
            value: 24,
            display: '7,6',
            className: 'text-success',
            tooltip: 'Выше среднего по отделу (6,8).',
        });
        expect(above.annotation?.text).toBe('по 24 звонкам');

        const below = presentAiScoreCell(
            { n: 30, score: 5.1, explanation: 'Текст бэка.' },
            { norm: 6.8 },
        );
        expect(below.action.className).toBe('text-destructive');
        // Текст бэка в подсказке важнее подсказки по норме.
        expect(below.action.tooltip).toBe('Текст бэка.');

        const near = presentAiScoreCell({ n: 30, score: 6.9 }, { norm: 6.8 });
        expect(near.action.className).toBeUndefined();
        expect(near.action.tooltip).toBe('Около среднего по отделу (6,8).');

        const noNorm = presentAiScoreCell({ n: 30, score: 6.9 });
        expect(noNorm.action.tooltip).toBeUndefined();
    });

    it('разборов хватает, а оценки нет: прочерк и причина — старый расчёт / части / ячейки', () => {
        const legacy = presentAiScoreCell({ n: 12, score: null });
        expect(legacy.action.display).toBe('—');
        expect(legacy.action.tooltip).toBe(AI_MATRIX_TEXT.hint.legacy);
        expect(legacy.annotation?.text).toBe('оценки нет · по 12 звонкам');
        expect(legacy.annotation?.remaining).toBe(0);

        const composed = presentAiScoreCell({ n: 12, score: null, composed: true });
        expect(composed.action.tooltip).toBe(AI_MATRIX_TEXT.hint.noPartScores(8));

        const totals = presentAiScoreCell({ n: 15, score: null, managers: 3 });
        expect(totals.action.tooltip).toBe(AI_MATRIX_TEXT.hint.noCellScores(8));
        expect(totals.annotation?.text).toBe('оценки нет · по 15 звонкам · 3 сотр.');
    });

    it('итог: «6,8 из 10», «по 42 звонкам · 3 сотр.»; частичная оценка помечена в подсказке', () => {
        const total = presentAiScoreCell({
            n: 42,
            score: 6.8,
            managers: 3,
            outOf: true,
            partial: true,
        });
        expect(total.action.display).toBe('6,8 из 10');
        expect(total.action.tooltip).toBe(AI_MATRIX_TEXT.hint.partialScore);
        expect(total.annotation?.text).toBe('по 42 звонкам · 3 сотр.');
    });
});
