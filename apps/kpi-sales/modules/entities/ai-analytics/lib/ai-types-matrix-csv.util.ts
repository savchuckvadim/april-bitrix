import type { RTableProps } from '@workspace/april-ui';
import {
    aiMatrixCellKey,
    type AiMatrixAnnotation,
} from './ai-matrix-table.util';
import { isAiMatrixSalesCode } from './ai-types-matrix.util';

/** Подпись колонки оценки в CSV по умолчанию: «Презентация — оценка». */
export const AI_MATRIX_CSV_SCORE_LABEL = 'оценка';

/**
 * Таблица для exportTableToCSV (он пишет только name/value): после каждой
 * колонки-счётчика — колонка «<Колонка> — <scoreLabel>» с оценкой из
 * аннотации ячейки числом; «мало данных» и ячейки без звонков → 0. Хвост
 * продаж колонок оценки не получает.
 */
export const buildAiMatrixCsvTable = (
    table: RTableProps,
    annotations: ReadonlyMap<string, AiMatrixAnnotation>,
    scoreLabel: string = AI_MATRIX_CSV_SCORE_LABEL,
): RTableProps => ({
    ...table,
    data: table.data.map(row => ({
        ...row,
        actions: row.actions.flatMap(action => {
            const code = action.code ?? action.name;
            if (isAiMatrixSalesCode(code)) return [action];
            const score =
                row.id === undefined
                    ? null
                    : annotations.get(aiMatrixCellKey(row.id, code))?.score;
            return [
                action,
                {
                    code: `${code}_score`,
                    name: `${action.name} — ${scoreLabel}`,
                    value: score ?? 0,
                },
            ];
        }),
    })),
});
