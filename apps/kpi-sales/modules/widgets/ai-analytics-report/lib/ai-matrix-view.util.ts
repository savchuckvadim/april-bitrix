import type { AiMatrixTable } from '@/modules/entities/ai-analytics/lib/ai-matrix-table.util';

/*
 * Мелкие производные матрицы для графиков: нормы по коду колонки-оценки
 * (среднее по отделу из итогов матрицы) — линия на графике оценок.
 */

/** Норма (среднее по отделу) по коду колонки-оценки; у хвоста продаж нормы нет. */
export const aiMatrixNorms = (
    matrix: AiMatrixTable,
): Map<string, number | null> =>
    new Map(
        matrix.columns
            .filter(column => !column.plain)
            .map(column => [column.code, matrix.totals.get(column.code)?.score ?? null]),
    );
