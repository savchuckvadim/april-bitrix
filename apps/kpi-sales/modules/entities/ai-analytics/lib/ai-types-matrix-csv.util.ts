import type { RTableProps } from '@workspace/april-ui';
import {
    AI_MATRIX_FEW_DATA,
    aiMatrixCellKey,
    type AiMatrixAnnotation,
} from './ai-matrix-table.util';
import { isAiMatrixSalesCode } from './ai-types-matrix.util';

/** Подпись колонки оценки в CSV по умолчанию: «Презентация — оценка». */
export const AI_MATRIX_CSV_SCORE_LABEL = 'оценка';

/** Ячейка оценки: звонков нет → пусто, оценки нет → «мало данных». */
const scoreCell = (annotation: AiMatrixAnnotation | undefined): string => {
    if (!annotation) return '';
    return annotation.score === null ? AI_MATRIX_FEW_DATA : String(annotation.score);
};

/**
 * Строки CSV матрицы AI для downloadCsvRows: шапка (firstCellName + колонки
 * первой строки) и строка на менеджера. После каждой колонки-счётчика —
 * колонка «<Колонка> — <scoreLabel>» с оценкой из аннотации ячейки:
 * «мало данных» — оценки нет, пустая ячейка — звонков нет. Хвост продаж
 * колонок оценки не получает. Пустая таблица → [].
 */
export const buildAiMatrixCsvRows = (
    table: RTableProps,
    annotations: ReadonlyMap<string, AiMatrixAnnotation>,
    scoreLabel: string = AI_MATRIX_CSV_SCORE_LABEL,
): string[][] => {
    const firstRow = table.data[0];
    if (!firstRow) return [];
    const header = [
        table.firstCellName,
        ...firstRow.actions.flatMap(action =>
            isAiMatrixSalesCode(action.code ?? action.name)
                ? [action.name]
                : [action.name, `${action.name} — ${scoreLabel}`],
        ),
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
            return [value, scoreCell(annotation)];
        }),
    ]);
    return [header, ...rows];
};
