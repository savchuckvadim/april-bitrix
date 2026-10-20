import type { RTableAction, RTableProps } from '@workspace/april-ui';
import type { AiTypeTotals } from '../model';
import { AI_MATRIX_TEXT } from './ai-matrix.texts';
import {
    presentAiScoreCell,
    type AiMatrixAnnotation,
    type AiMatrixPresentOptions,
} from './ai-matrix-cell.util';
import {
    AI_MATRIX_FIRST_CELL,
    aiMatrixCellKey,
    aiMatrixColumnHints,
    type AiMatrixBackendTotal,
    type AiMatrixTable,
} from './ai-matrix-table.util';
import { isAiMetricHidden } from './ai-metric.util';

/*
 * Строка «Итого по отделу» под матрицей (как KPIReportTotalTable): отдельная
 * RTable с одной строкой id 0 и без ссылки. Ячейка — «6,8 из 10», мелко
 * «по 42 звонкам · 3 сотр.», либо «ещё 4» и «до оценки · по 4 звонкам».
 * Итоги считает buildAiMatrix (бэк для сводной, строки для секций).
 */

export const AI_MATRIX_TOTALS_ROW_ID = 0;
export const AI_MATRIX_TOTALS_CODE_SUFFIX = '-totals';

/** Класс строки итогов (выделена, как в KPIReportTotalTable). */
export const AI_MATRIX_TOTALS_ROW_CLASS = 'bg-muted/50 font-semibold';

export interface AiMatrixTotalsTable {
    table: RTableProps;
    annotations: Map<string, AiMatrixAnnotation>;
}

/** Таблица-строка «Итого по отделу» по итогам матрицы. */
export const buildAiMatrixTotalsTable = (
    matrix: AiMatrixTable,
    options: Omit<AiMatrixPresentOptions, 'norm'> = {},
    /** Подсказка ячеек без своего объяснения (с чем сравниваются строки). */
    rowTooltip?: string,
): AiMatrixTotalsTable => {
    const annotations = new Map<string, AiMatrixAnnotation>();
    const actions = matrix.columns.map((column): RTableAction => {
        const total = matrix.totals.get(column.code);
        if (column.plain || !total) {
            return { code: column.code, name: column.name, value: total?.n ?? 0 };
        }
        const presented = presentAiScoreCell(
            { ...total, outOf: true, managers: total.managers },
            options,
        );
        if (presented.annotation) {
            annotations.set(
                aiMatrixCellKey(AI_MATRIX_TOTALS_ROW_ID, column.code),
                presented.annotation,
            );
        }
        const tooltip = presented.action.tooltip ?? rowTooltip;
        return {
            code: column.code,
            name: column.name,
            ...presented.action,
            ...(tooltip ? { tooltip } : {}),
        };
    });
    const columnHints = aiMatrixColumnHints(matrix.columns);
    return {
        table: {
            code: `${matrix.table.code}${AI_MATRIX_TOTALS_CODE_SUFFIX}`,
            firstCellName: AI_MATRIX_FIRST_CELL,
            data: [
                {
                    id: AI_MATRIX_TOTALS_ROW_ID,
                    name: AI_MATRIX_TEXT.totalsRow,
                    actions,
                    className: AI_MATRIX_TOTALS_ROW_CLASS,
                },
            ],
            ...(columnHints ? { columnHints } : {}),
        },
        annotations,
    };
};

/** Итог типа с бэка (totalsByType) → итог колонки с объяснением бэка. */
export const aiTypeTotalToBackend = (
    total: AiTypeTotals,
): AiMatrixBackendTotal => ({
    n: total.n,
    score: isAiMetricHidden(total.score) ? null : total.score.value,
    managers: total.managers,
    explanation: total.explanation?.text || null,
});
