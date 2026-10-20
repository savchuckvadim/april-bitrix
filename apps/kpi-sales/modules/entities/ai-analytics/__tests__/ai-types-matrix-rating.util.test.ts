import { describe, expect, it } from 'vitest';
import {
    AI_RATING_MIN_N,
    AI_SECTION_COUNT_SUFFIX,
    AI_TYPE_COUNT_SUFFIX,
    aiScoreRatingVolume,
    buildAiMatrixCountDataset,
    buildAiMatrixScorePoints,
    isAiRatingPreliminary,
    weightedAiScoreRating,
    type AiScoreRatingPoint,
} from '../lib/ai-types-matrix-rating.util';
import { buildAiSectionsMatrixTable } from '../lib/ai-sections-matrix.util';
import {
    aiMatrixPresentTypes,
    aiMatrixVisibleTypes,
    buildAiTypesMatrixFor,
} from '../lib/ai-types-matrix.util';
import { CALL_TYPES, managerName, matrixRows } from './ai-types-matrix-fixtures';

const typesMatrix = (hidden: string[] = []) =>
    buildAiTypesMatrixFor(
        matrixRows(),
        aiMatrixVisibleTypes(aiMatrixPresentTypes(matrixRows(), CALL_TYPES), hidden),
        { managerName, callTypes: CALL_TYPES, mode: 'types' },
    );

const sectionsMatrix = () =>
    buildAiSectionsMatrixTable(matrixRows(), 'presentation', { managerName });

describe('датасеты счётчиков (RatingDataset) из матрицы', () => {
    it('типы: «<Тип> — разборов» по видимым типам + хвост продаж как есть', () => {
        const dataset = buildAiMatrixCountDataset(typesMatrix(['cold']), AI_TYPE_COUNT_SUFFIX);
        expect(dataset.actions).toEqual([
            { code: 'presentation', name: 'Презентация — разборов' },
            { code: 'decision', name: 'Решение — разборов' },
            { code: 'other', name: 'Прочее — разборов' },
            { code: 'sales_count', name: 'Продажи, шт.' },
            { code: 'advance_amount', name: 'Аванс, ₽' },
            { code: 'monthly_amount', name: 'Мес. чек, ₽' },
        ]);
        expect(dataset.rows[0]).toEqual({
            userId: 7,
            name: 'Иванов Иван',
            values: {
                presentation: 12,
                decision: 0,
                other: 2,
                sales_count: 3,
                advance_amount: 150000,
                monthly_amount: 42000,
            },
        });
        expect(dataset.rows[1]?.values.decision).toBe(9);
    });

    it('разделы: «<Раздел> — оценённых звонков» + «Итог — оценённых звонков»', () => {
        const dataset = buildAiMatrixCountDataset(sectionsMatrix(), AI_SECTION_COUNT_SUFFIX);
        expect(dataset.actions.map(action => action.name)).toEqual([
            'Приветствие — оценённых звонков',
            'Выявление потребностей — оценённых звонков',
            'Закрытие — оценённых звонков',
            'Итог — оценённых звонков',
        ]);
        expect(dataset.rows[1]).toEqual({
            userId: 3,
            name: 'Петров Пётр',
            values: { GREETING: 0, NEEDS: 20, CLOSING: 8, all: 25 },
        });
    });
});

describe('точки оценок из матрицы', () => {
    it('по типам: ячейки со звонками, score из аннотации, n = разборов; продажи — нет', () => {
        expect(buildAiMatrixScorePoints(typesMatrix(['cold', 'other']))).toEqual([
            { userId: 7, name: 'Иванов Иван', code: 'presentation', score: 6.4, n: 12 },
            { userId: 3, name: 'Петров Пётр', code: 'presentation', score: 7.1, n: 25 },
            { userId: 3, name: 'Петров Пётр', code: 'decision', score: 5.5, n: 9 },
        ]);
    });

    it('по разделам типа: средняя/n разделов плюс all — оценка типа', () => {
        expect(
            buildAiMatrixScorePoints(sectionsMatrix()).map(
                ({ userId, code, score, n }) => [userId, code, score, n],
            ),
        ).toEqual([
            [7, 'GREETING', 4.2, 10],
            [7, 'NEEDS', null, 3],
            [7, 'all', 6.4, 12],
            [3, 'NEEDS', 6, 20],
            [3, 'CLOSING', 7.5, 8],
            [3, 'all', 7.1, 25],
        ]);
    });
});

describe('weightedAiScoreRating — взвешенное по n среднее', () => {
    const p = (
        userId: number,
        score: number | null,
        n: number,
        code = 'x',
    ): AiScoreRatingPoint => ({ userId, name: `u${userId}`, code, score, n });

    it('8 (n = 2) и 5 (n = 6) → 5,8: сумма оценок не берётся', () => {
        expect(weightedAiScoreRating([p(1, 8, 2), p(1, 5, 6)], 'x')).toEqual([
            { name: 'u1', value: 5.8 },
        ]);
    });

    it('по сотрудникам: сортировка по убыванию, без оценки — опущены, чужой код — не учитывается', () => {
        const points = [
            p(1, 8, 2),
            p(1, 5, 6),
            p(2, 7, 4),
            p(3, 9, 1),
            p(4, null, 10),
            p(5, 3, 0),
            p(6, 10, 50, 'y'),
        ];
        expect(weightedAiScoreRating(points, 'x')).toEqual([
            { name: 'u3', value: 9 },
            { name: 'u2', value: 7 },
            { name: 'u1', value: 5.8 },
        ]);
        expect(weightedAiScoreRating(points, 'z')).toEqual([]);
    });

    it('по группам: Σ(score·n)/Σn по userIds группы; группа без оценок опущена', () => {
        const points = [p(1, 8, 2), p(1, 5, 6), p(2, 7, 4), p(3, 9, 1), p(4, null, 10)];
        const groups = [
            { id: 'a', name: 'Отдел А', userIds: [1, 2] },
            { id: 'b', name: 'Отдел Б', userIds: [3] },
            { id: 'c', name: 'Пустой', userIds: [4, 9] },
        ];
        expect(weightedAiScoreRating(points, 'x', groups)).toEqual([
            { name: 'Отдел Б', value: 9 },
            { name: 'Отдел А', value: 6.2 },
        ]);
    });

    it('точки разделов: NEEDS у менеджера без средней опущен, all — оценки типов', () => {
        const points = buildAiMatrixScorePoints(sectionsMatrix());
        expect(weightedAiScoreRating(points, 'NEEDS')).toEqual([
            { name: 'Петров Пётр', value: 6 },
        ]);
        expect(weightedAiScoreRating(points, 'all')).toEqual([
            { name: 'Петров Пётр', value: 7.1 },
            { name: 'Иванов Иван', value: 6.4 },
        ]);
    });

    it('объём рейтинга и порог предварительности 50 разборов', () => {
        const points = buildAiMatrixScorePoints(typesMatrix());
        expect(aiScoreRatingVolume(points, 'presentation')).toBe(37);
        expect(aiScoreRatingVolume(points, 'cold')).toBe(0);
        expect(AI_RATING_MIN_N).toBe(50);
        expect(isAiRatingPreliminary(37)).toBe(true);
        expect(isAiRatingPreliminary(50)).toBe(false);
    });
});
