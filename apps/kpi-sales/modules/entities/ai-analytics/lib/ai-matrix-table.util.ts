import type { RTableAction, RTableProps, RTableRow } from '@workspace/april-ui';
import type { AiByTypeWideRow } from '../model';
import {
    groupAiRowsByManager,
    type AiManagerRowsGroup,
} from './ai-by-type.util';
import { AI_MATRIX_TEXT } from './ai-matrix.texts';
import {
    presentAiScoreCell,
    type AiMatrixAnnotation,
    type AiMatrixPresentOptions,
    type AiMatrixScoreSource,
} from './ai-matrix-cell.util';
import { aiWeightedScore } from './ai-matrix-norm.util';

/*
 * Общая сборка матриц KPI-вида по срезу «все типы × wide» (секция
 * typesMatrix): строка на менеджера, ячейка — оценка крупно и число
 * разборов мелко (presentAiScoreCell), хвост продаж — обычные числа.
 * Контракт RTable (@workspace/april-ui): аннотации по ключу
 * `${rowId}:${actionCode}`, rowId = Number(managerId). Норма ячейки —
 * итог той же колонки (бэк для сводной, иначе взвешенное среднее строк).
 * Конкретные блоки — ai-types-matrix.util и ai-sections-matrix.util.
 */

export const AI_MATRIX_FIRST_CELL = AI_MATRIX_TEXT.firstCell;

export type { AiMatrixAnnotation } from './ai-matrix-cell.util';

/** Колонка матрицы: стабильный код показателя (actionCode) и подпись шапки. */
export interface AiMatrixColumn {
    code: string;
    name: string;
    /** Подсказка к колонке (например, «вне средней оценки») — в шапку и CSV. */
    hint?: string;
    /** Колонка-число без оценки (хвост продаж): value как есть, в итоге — сумма. */
    plain?: boolean;
    /** Тип звонка колонки: клик по шапке открывает срез по этому типу. */
    callType?: string;
}

/** Ячейка до представления: число (хвост продаж) либо оценка с объёмом. */
export type AiMatrixCell =
    | { kind: 'plain'; value: number }
    | ({ kind: 'score' } & AiMatrixScoreSource);

export const AI_MATRIX_EMPTY_CELL: AiMatrixCell = {
    kind: 'score',
    n: 0,
    score: null,
};

export const aiPlainCell = (value: number): AiMatrixCell => ({
    kind: 'plain',
    value,
});

export const aiScoreCell = (source: AiMatrixScoreSource): AiMatrixCell => ({
    kind: 'score',
    ...source,
});

/** Ячейка по строкам менеджера и колонке. */
export type AiMatrixCellOf = (
    group: AiManagerRowsGroup<AiByTypeWideRow>,
    column: AiMatrixColumn,
) => AiMatrixCell;

/** Итог колонки: объём, оценка, сотрудников со звонками; у plain — n = сумма. */
export interface AiMatrixColumnTotal extends AiMatrixScoreSource {
    code: string;
    managers: number;
}

/** Подпись менеджера и отбор строк (userIds — секция «По отделам / По группам»). */
export interface AiMatrixManagerOptions {
    managerName: (id: string) => string;
    userIds?: ReadonlySet<number>;
    /** Скрыть сотрудников без единого разбора в колонках-оценках (их id — в hiddenUserIds). */
    onlyWithReviews?: boolean;
}

/** Итог колонки с бэка: известные поля перекрывают посчитанные по строкам. */
export type AiMatrixBackendTotal = Partial<
    Omit<AiMatrixColumnTotal, 'code'>
>;

export interface AiMatrixBuildOptions
    extends AiMatrixManagerOptions,
        Omit<AiMatrixPresentOptions, 'norm'> {
    /** Итоги колонок с бэка (сводная таблица): поля перекрывают посчитанные по строкам. */
    totals?: ReadonlyMap<string, AiMatrixBackendTotal>;
}

export interface AiMatrixTable {
    table: RTableProps;
    /** Подстроки ячеек по ключу `${rowId}:${actionCode}`; у ячеек без звонков нет. */
    annotations: Map<string, AiMatrixAnnotation>;
    /** Колонки по порядку (рейтингам и CSV нужны и при пустых данных). */
    columns: AiMatrixColumn[];
    /** Итоги по колонкам — норма ячеек и строка «Итого по отделу». */
    totals: Map<string, AiMatrixColumnTotal>;
    /** Сотрудники, скрытые как «без разборов за период» (onlyWithReviews). */
    hiddenUserIds: number[];
}

export const aiMatrixCellKey = (rowId: number, code: string): string =>
    `${rowId}:${code}`;

interface RawRow {
    id: number;
    name: string;
    cells: AiMatrixCell[];
}

const hasReviews = (cells: AiMatrixCell[]): boolean =>
    cells.some(cell => cell.kind === 'score' && cell.n > 0);

const pickManagers = (
    rows: AiByTypeWideRow[],
    userIds?: ReadonlySet<number>,
): AiManagerRowsGroup<AiByTypeWideRow>[] =>
    groupAiRowsByManager(rows).filter(
        group => !userIds || userIds.has(Number(group.managerId)),
    );

/** Итог колонки по строкам: plain — сумма; оценка — взвешенное среднее по n. */
const columnTotal = (
    column: AiMatrixColumn,
    index: number,
    rows: RawRow[],
): AiMatrixColumnTotal => {
    const cells = rows.map(row => row.cells[index] ?? AI_MATRIX_EMPTY_CELL);
    if (column.plain) {
        const sum = cells.reduce(
            (acc, cell) => acc + (cell.kind === 'plain' ? cell.value : 0),
            0,
        );
        return { code: column.code, n: sum, score: null, managers: rows.length };
    }
    const points = cells.flatMap(cell =>
        cell.kind === 'score' ? [{ score: cell.score, n: cell.n }] : [],
    );
    const weighted = aiWeightedScore(points);
    return {
        code: column.code,
        n: weighted.n,
        score: weighted.score,
        managers: points.filter(point => point.n > 0).length,
        partial: weighted.score !== null && weighted.scoredN < weighted.n,
    };
};

/** Итоги всех колонок; поля итогов с бэка перекрывают посчитанные по строкам. */
export const aiMatrixTotals = (
    columns: AiMatrixColumn[],
    rows: RawRow[],
    backend?: ReadonlyMap<string, AiMatrixBackendTotal>,
): Map<string, AiMatrixColumnTotal> =>
    new Map(
        columns.map((column, index) => {
            const computed = columnTotal(column, index, rows);
            const known = backend?.get(column.code);
            return [
                column.code,
                known ? { ...computed, ...known, code: column.code } : computed,
            ];
        }),
    );

const presentRow = (
    row: RawRow,
    columns: AiMatrixColumn[],
    totals: ReadonlyMap<string, AiMatrixColumnTotal>,
    options: AiMatrixBuildOptions,
    annotations: Map<string, AiMatrixAnnotation>,
): RTableRow => ({
    id: row.id,
    name: row.name,
    actions: columns.map((column, index): RTableAction => {
        const cell = row.cells[index] ?? AI_MATRIX_EMPTY_CELL;
        if (cell.kind === 'plain') {
            return { code: column.code, name: column.name, value: cell.value };
        }
        const presented = presentAiScoreCell(cell, {
            norm: totals.get(column.code)?.score ?? null,
            thresholds: options.thresholds,
            comparableFrom: options.comparableFrom,
        });
        if (presented.annotation) {
            annotations.set(
                aiMatrixCellKey(row.id, column.code),
                presented.annotation,
            );
        }
        return { code: column.code, name: column.name, ...presented.action };
    }),
});

/** Подсказки шапки по колонкам с hint (пусто — поля в таблице нет). */
export const aiMatrixColumnHints = (
    columns: AiMatrixColumn[],
): Map<string, string> | undefined => {
    const hints = new Map<string, string>(
        columns.flatMap(column =>
            column.hint ? [[column.code, column.hint] as const] : [],
        ),
    );
    return hints.size ? hints : undefined;
};

/**
 * Сборка матрицы: строка на менеджера (порядок появления), ячейка — cellOf;
 * сначала итоги колонок (норма), затем представление ячеек с цветом
 * относительно нормы. Сотрудники без разборов при onlyWithReviews скрыты.
 */
export const buildAiMatrix = (
    code: string,
    rows: AiByTypeWideRow[],
    columns: AiMatrixColumn[],
    options: AiMatrixBuildOptions,
    cellOf: AiMatrixCellOf,
): AiMatrixTable => {
    const raw: RawRow[] = pickManagers(rows, options.userIds).map(group => ({
        id: Number(group.managerId),
        name: options.managerName(group.managerId),
        cells: columns.map(column => cellOf(group, column)),
    }));
    const visible = options.onlyWithReviews
        ? raw.filter(row => hasReviews(row.cells))
        : raw;
    const hiddenUserIds = raw
        .filter(row => !visible.includes(row))
        .map(row => row.id);
    const totals = aiMatrixTotals(columns, visible, options.totals);
    const annotations = new Map<string, AiMatrixAnnotation>();
    const data = visible.map(row =>
        presentRow(row, columns, totals, options, annotations),
    );
    const columnHints = aiMatrixColumnHints(columns);
    return {
        table: {
            code,
            firstCellName: AI_MATRIX_FIRST_CELL,
            data,
            ...(columnHints ? { columnHints } : {}),
        },
        annotations,
        columns,
        totals,
        hiddenUserIds,
    };
};
