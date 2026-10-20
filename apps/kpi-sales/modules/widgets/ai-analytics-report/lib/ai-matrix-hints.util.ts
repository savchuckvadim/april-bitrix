import type { AiMatrixColumn } from '@/modules/entities/ai-analytics/lib/ai-matrix-table.util';
import { aiBucketOfColumnCode } from '@/modules/entities/ai-analytics/lib/ai-matrix-buckets.util';
import { AI_SECTIONS_MATRIX_ALL } from '@/modules/entities/ai-analytics/lib/ai-sections-matrix.util';
import { isAiCallSectionCode } from '@/modules/entities/ai-analytics/lib/ai-call-sections.data';
import { AI_MATRIX_BLOCK_TEXT } from './ai-matrix-texts';

/*
 * Подсказки шапки матриц (RTable columnHints): что значит колонка и что с
 * ней делать. Пометка колонки из сущности («вне средней оценки») остаётся
 * первой строкой — поведение типа «Мероприятие» сохранено.
 */

const T = AI_MATRIX_BLOCK_TEXT;

const withColumnHint = (column: AiMatrixColumn, text: string): string =>
    column.hint ? `${column.hint}. ${text}` : text;

/** Подсказки колонок блока «AI: типы звонков»: корзина, тип, хвост продаж. */
export const aiTypesColumnHints = (
    columns: AiMatrixColumn[],
): Map<string, string> =>
    new Map(
        columns.map(column => {
            if (column.plain) return [column.code, T.types.salesHint];
            const bucket = aiBucketOfColumnCode(column.code);
            if (bucket) {
                return [
                    column.code,
                    `${T.types.bucketHint[bucket]} ${T.types.bucketAction}`,
                ];
            }
            return [column.code, withColumnHint(column, T.types.typeHint(column.name))];
        }),
    );

/** Подсказки колонок блока разделов: раздел с важностью для типа, «Итог». */
export const aiSectionsColumnHints = (
    columns: AiMatrixColumn[],
    relevance: ReadonlyMap<string, number>,
    allTypes: boolean,
): Map<string, string> =>
    new Map(
        columns.map(column => {
            if (column.code === AI_SECTIONS_MATRIX_ALL.code) {
                return [column.code, T.sections.totalHint(allTypes)];
            }
            const description = isAiCallSectionCode(column.code)
                ? T.sections.sectionDescription[column.code]
                : T.sections.sectionDescriptionFallback;
            return [
                column.code,
                T.sections.sectionHint(
                    column.name,
                    description,
                    relevance.get(column.code) ?? null,
                ),
            ];
        }),
    );
