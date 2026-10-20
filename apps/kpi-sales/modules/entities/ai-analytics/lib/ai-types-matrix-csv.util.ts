import type { RTableProps } from '@workspace/april-ui';
import { AI_CALL_TYPE_OUTSIDE_SCORE_SHORT } from './ai-call-types.data';
import { AI_MATRIX_TEXT } from './ai-matrix.texts';
import { aiMatrixCellKey, type AiMatrixAnnotation } from './ai-matrix-table.util';
import { isAiMatrixSalesCode } from './ai-types-matrix.util';

/*
 * CSV матриц AI: у каждой колонки-оценки две колонки — оценка и число
 * разборов. Оценка — число; при нехватке разборов — «ещё N до оценки»
 * (не 0); без звонков — пусто. Хвост продаж — как есть.
 */

/** Подпись колонки оценки в CSV по умолчанию: «Презентация — оценка». */
export const AI_MATRIX_CSV_SCORE_LABEL = AI_MATRIX_TEXT.csv.score;
/** Подпись колонки числа разборов: «Презентация — разборов». */
export const AI_MATRIX_CSV_CALLS_LABEL = AI_MATRIX_TEXT.csv.calls;

/** Ячейка оценки: звонков нет → пусто, не хватает → «ещё N до оценки», иначе число. */
const scoreCell = (annotation: AiMatrixAnnotation | undefined): string => {
    if (!annotation) return '';
    if (annotation.score !== null) return String(annotation.score);
    return annotation.remaining > 0
        ? AI_MATRIX_TEXT.csv.remaining(annotation.remaining)
        : '';
};

/**
 * Подпись колонки в CSV: у колонки с подсказкой (тип вне средней оценки) —
 * короткая пометка в скобках: «Мероприятие (вне средней оценки)».
 */
const csvColumnName = (table: RTableProps, code: string, name: string): string =>
    table.columnHints?.has(code)
        ? `${name} (${AI_CALL_TYPE_OUTSIDE_SCORE_SHORT})`
        : name;

/**
 * Строки CSV матрицы AI для downloadCsvRows: шапка (firstCellName + колонки
 * первой строки) и строка на менеджера. Колонка-оценка → «<Колонка> —
 * оценка» и «<Колонка> — разборов»; хвост продаж — одна колонка.
 * Пустая таблица → []. withHeader = false — только строки (для итогов).
 */
export const buildAiMatrixCsvRows = (
    table: RTableProps,
    annotations: ReadonlyMap<string, AiMatrixAnnotation>,
    scoreLabel: string = AI_MATRIX_CSV_SCORE_LABEL,
    withHeader = true,
): string[][] => {
    const firstRow = table.data[0];
    if (!firstRow) return [];
    const header = [
        table.firstCellName,
        ...firstRow.actions.flatMap(action => {
            const code = action.code ?? action.name;
            if (isAiMatrixSalesCode(code)) return [action.name];
            const name = csvColumnName(table, code, action.name);
            return [`${name} — ${scoreLabel}`, `${name} — ${AI_MATRIX_CSV_CALLS_LABEL}`];
        }),
    ];
    const rows = table.data.map(row => [
        row.name,
        ...row.actions.flatMap(action => {
            const code = action.code ?? action.name;
            const value = String(action.value);
            if (isAiMatrixSalesCode(code)) return [value];
            const annotation =
                row.id === undefined
                    ? undefined
                    : annotations.get(aiMatrixCellKey(row.id, code));
            return [scoreCell(annotation), value];
        }),
    ]);
    return withHeader ? [header, ...rows] : rows;
};
