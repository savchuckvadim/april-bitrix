import type {
    RTableAnnotation,
    RTableProps,
    RTableRow,
} from '@workspace/april-ui';
import type { AiByTypeWideRow, AiMetric } from '../model';
import {
    groupAiRowsByManager,
    type AiManagerRowsGroup,
} from './ai-by-type.util';
import { isAiMetricHidden } from './ai-metric.util';
import { formatAiScore } from './ai-score.util';

/*
 * Общая сборка матриц KPI-вида по срезу «все типы × wide» (секция
 * typesMatrix): строка на менеджера, колонки-счётчики с подстрокой-оценкой.
 * Контракт RTable (@workspace/april-ui): аннотации по ключу
 * `${rowId}:${actionCode}`, rowId = Number(managerId). Конкретные блоки —
 * ai-types-matrix.util (типы звонков) и ai-sections-matrix.util (разделы
 * рубрики типа).
 */

export const AI_MATRIX_FIRST_CELL = 'Менеджер';
/** Подстрока ячейки без оценки (мало оценённых звонков) — число звонков уже в счётчике. */
export const AI_MATRIX_FEW_DATA = 'мало данных';

/** Колонка матрицы: стабильный код показателя (actionCode) и подпись шапки. */
export interface AiMatrixColumn {
    code: string;
    name: string;
}

/** Аннотация ячейки-счётчика; score — та же оценка числом (для CSV, RTable читает text). */
export interface AiMatrixAnnotation extends RTableAnnotation {
    /** Оценка ячейки; null — «мало данных». */
    score: number | null;
}

export interface AiMatrixTable {
    table: RTableProps;
    /** Подстроки ячеек по ключу `${rowId}:${actionCode}`; у ячеек без звонков нет. */
    annotations: Map<string, AiMatrixAnnotation>;
    /** Колонки по порядку (рейтингам и CSV нужны и при пустых данных). */
    columns: AiMatrixColumn[];
}

/** Подпись менеджера и отбор строк (userIds — секция «По отделам / По группам»). */
export interface AiMatrixManagerOptions {
    managerName: (id: string) => string;
    userIds?: ReadonlySet<number>;
}

export const aiMatrixCellKey = (rowId: number, code: string): string =>
    `${rowId}:${code}`;

const annotation = (
    text: string,
    score: number | null,
): AiMatrixAnnotation => ({ text, score });

/**
 * Подстрока счётчика разборов типа: «оценка 6,4» при достаточном n,
 * «мало данных» при доверии none (value = null); без звонков — null.
 */
export const aiMatrixScoreAnnotation = (
    score: AiMetric,
    n: number,
): AiMatrixAnnotation | null => {
    if (n <= 0) return null;
    const value = isAiMetricHidden(score) ? null : score.value;
    return value === null
        ? annotation(AI_MATRIX_FEW_DATA, null)
        : annotation(`оценка ${formatAiScore(value)}`, value);
};

/** Подстрока счётчика раздела: средняя «4,2» либо «мало данных»; без звонков — null. */
export const aiMatrixSectionAnnotation = (
    avgScore: number | null,
    n: number,
): AiMatrixAnnotation | null => {
    if (n <= 0) return null;
    return avgScore === null
        ? annotation(AI_MATRIX_FEW_DATA, null)
        : annotation(formatAiScore(avgScore), avgScore);
};

/** Ячейка матрицы: значение-счётчик и подстрока (null — без подстроки). */
export interface AiMatrixCell {
    value: number;
    annotation: AiMatrixAnnotation | null;
}

export const AI_MATRIX_EMPTY_CELL: AiMatrixCell = {
    value: 0,
    annotation: null,
};

/** Ячейка по строкам менеджера и колонке. */
export type AiMatrixCellOf = (
    group: AiManagerRowsGroup<AiByTypeWideRow>,
    column: AiMatrixColumn,
) => AiMatrixCell;

const pickManagers = (
    rows: AiByTypeWideRow[],
    userIds?: ReadonlySet<number>,
): AiManagerRowsGroup<AiByTypeWideRow>[] =>
    groupAiRowsByManager(rows).filter(
        group => !userIds || userIds.has(Number(group.managerId)),
    );

/** Сборка матрицы: строка на менеджера (порядок появления), ячейка — cellOf. */
export const buildAiMatrix = (
    code: string,
    rows: AiByTypeWideRow[],
    columns: AiMatrixColumn[],
    { managerName, userIds }: AiMatrixManagerOptions,
    cellOf: AiMatrixCellOf,
): AiMatrixTable => {
    const annotations = new Map<string, AiMatrixAnnotation>();
    const data: RTableRow[] = pickManagers(rows, userIds).map(group => {
        const id = Number(group.managerId);
        const actions = columns.map(column => {
            const cell = cellOf(group, column);
            if (cell.annotation) {
                annotations.set(
                    aiMatrixCellKey(id, column.code),
                    cell.annotation,
                );
            }
            return { code: column.code, name: column.name, value: cell.value };
        });
        return { id, name: managerName(group.managerId), actions };
    });
    return {
        table: { code, firstCellName: AI_MATRIX_FIRST_CELL, data },
        annotations,
        columns,
    };
};
