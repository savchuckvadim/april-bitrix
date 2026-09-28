import type { AiByTypeWideRow } from '../model';
import type { AiMatrixColumn, AiMatrixTable } from './ai-matrix-table.util';
import {
    buildAiTypesMatrixFor,
    isAiMatrixSalesCode,
    type AiMatrixType,
} from './ai-types-matrix.util';
import {
    AI_SECTIONS_MATRIX_ALL,
    buildAiSectionsMatrixTable,
} from './ai-sections-matrix.util';

/*
 * Рейтинги-победители матриц AI. Счётчики — датасет в форме RatingDataset
 * фичи report-rating (EntityRatingChart / RatingFooter суммируют по
 * сотрудникам и секциям). Оценки суммировать нельзя — для них точки
 * {score, n} и взвешенное среднее Σ(score·n)/Σn (AiScoreRatingChart).
 */

export interface AiRatingAction {
    code: string;
    name: string;
}

export interface AiRatingDatasetRow {
    userId: number;
    name: string;
    values: Record<string, number>;
}

/** Структурно совпадает с RatingDataset (feature/report-rating): entity фичу не импортирует. */
export interface AiRatingDataset {
    actions: AiRatingAction[];
    rows: AiRatingDatasetRow[];
}

export type AiManagerNameFn = (id: string) => string;

const TYPE_COUNT_SUFFIX = ' — разборов';
const SECTION_COUNT_SUFFIX = ' — оценённых звонков';

/** Матрица → датасет рейтингов; подпись показателя задаёт name(column). */
const matrixToRatingDataset = (
    matrix: AiMatrixTable,
    name: (column: AiMatrixColumn) => string,
): AiRatingDataset => ({
    actions: matrix.columns.map(column => ({
        code: column.code,
        name: name(column),
    })),
    rows: matrix.table.data.map(row => ({
        userId: row.id ?? 0,
        name: row.name,
        values: Object.fromEntries(
            row.actions.map(action => [
                action.code ?? action.name,
                action.value,
            ]),
        ),
    })),
});

/** «<Тип> — разборов» по видимым типам + «Продажи, шт.», «Аванс, ₽», «Мес. чек, ₽». */
export const buildAiTypesCountRatingDataset = (
    rows: AiByTypeWideRow[],
    visibleTypes: AiMatrixType[],
    managerName: AiManagerNameFn,
): AiRatingDataset =>
    matrixToRatingDataset(
        buildAiTypesMatrixFor(rows, visibleTypes, { managerName }),
        column =>
            isAiMatrixSalesCode(column.code)
                ? column.name
                : `${column.name}${TYPE_COUNT_SUFFIX}`,
    );

/** «<Раздел> — оценённых звонков» по разделам типа + «Все разборы». */
export const buildAiSectionsCountRatingDataset = (
    rows: AiByTypeWideRow[],
    callType: string,
    managerName: AiManagerNameFn,
): AiRatingDataset =>
    matrixToRatingDataset(
        buildAiSectionsMatrixTable(rows, callType, { managerName }),
        column =>
            column.code === AI_SECTIONS_MATRIX_ALL.code
                ? column.name
                : `${column.name}${SECTION_COUNT_SUFFIX}`,
    );

/* ---------- Оценки: точки и взвешенное среднее ---------- */

/** Оценка показателя code у сотрудника с весом n; score = null — «мало данных». */
export interface AiScoreRatingPoint {
    userId: number;
    name: string;
    code: string;
    score: number | null;
    n: number;
}

export interface AiScoreRatingRow {
    name: string;
    value: number;
}

/** Сущность рейтинга по секциям (отдел/группа); StructureSection подходит структурно. */
export interface AiScoreRatingGroup {
    name: string;
    userIds: readonly number[];
}

const point = (
    row: AiByTypeWideRow,
    managerName: AiManagerNameFn,
    code: string,
    score: number | null,
    n: number,
): AiScoreRatingPoint => ({
    userId: Number(row.managerId),
    name: managerName(row.managerId),
    code,
    score,
    n,
});

/** Точки по типам: code = тип, score = оценка типа (cell.score.value), n = разборов. */
export const buildAiTypesScorePoints = (
    rows: AiByTypeWideRow[],
    visibleTypes: AiMatrixType[],
    managerName: AiManagerNameFn,
): AiScoreRatingPoint[] => {
    const codes = new Set(visibleTypes.map(type => type.code));
    return rows
        .filter(row => codes.has(row.cell.callType))
        .map(row =>
            point(
                row,
                managerName,
                row.cell.callType,
                row.cell.score.value,
                row.cell.n,
            ),
        );
};

/** Точки по разделам типа (avgScore / n) плюс code 'all' — оценка типа. */
export const buildAiSectionsScorePoints = (
    rows: AiByTypeWideRow[],
    callType: string,
    managerName: AiManagerNameFn,
): AiScoreRatingPoint[] =>
    rows
        .filter(row => row.cell.callType === callType)
        .flatMap(row => [
            ...row.cell.sections.map(section =>
                point(
                    row,
                    managerName,
                    section.section,
                    section.avgScore,
                    section.n,
                ),
            ),
            point(
                row,
                managerName,
                AI_SECTIONS_MATRIX_ALL.code,
                row.cell.score.value,
                row.cell.n,
            ),
        ]);

type ScoredPoint = AiScoreRatingPoint & { score: number };

const isScored = (
    point: AiScoreRatingPoint,
    code: string,
): point is ScoredPoint =>
    point.code === code && point.score !== null && point.n > 0;

interface WeightedAcc {
    name: string;
    sum: number;
    n: number;
}

/** До 0,1: 5.75 → 5.8. */
const roundScore = (value: number): number => Math.round(value * 10) / 10;

/**
 * Рейтинг по оценке показателя code: взвешенное по n среднее Σ(score·n)/Σn
 * по точкам со score ≠ null и n > 0. Без groups — по сотрудникам; с groups
 * (отделы/группы) — по сущностям с их userIds. Сущности без единой оценки
 * опущены; сортировка по убыванию.
 */
export const weightedAiScoreRating = (
    points: readonly AiScoreRatingPoint[],
    code: string,
    groups?: readonly AiScoreRatingGroup[],
): AiScoreRatingRow[] => {
    const scored = points.filter((item): item is ScoredPoint =>
        isScored(item, code),
    );
    const accs = new Map<string, WeightedAcc>();
    const add = (key: string, name: string, item: ScoredPoint): void => {
        const acc = accs.get(key) ?? { name, sum: 0, n: 0 };
        acc.sum += item.score * item.n;
        acc.n += item.n;
        accs.set(key, acc);
    };
    if (groups) {
        groups.forEach((group, index) => {
            for (const item of scored) {
                if (group.userIds.includes(item.userId))
                    add(`group:${index}`, group.name, item);
            }
        });
    } else {
        for (const item of scored) add(String(item.userId), item.name, item);
    }
    return [...accs.values()]
        .map(acc => ({ name: acc.name, value: roundScore(acc.sum / acc.n) }))
        .sort((a, b) => b.value - a.value);
};
