import type { AiByTypeWideRow } from '../model';
import {
    AI_MATRIX_EMPTY_CELL,
    aiMatrixScoreAnnotation,
    aiMatrixSectionAnnotation,
    buildAiMatrix,
    type AiMatrixCellOf,
    type AiMatrixColumn,
    type AiMatrixManagerOptions,
    type AiMatrixTable,
} from './ai-matrix-table.util';

/*
 * Блок «AI: разделы оценки по типу» (KPI-вид): менеджер × раздел рубрики
 * выбранного типа — число оценённых звонков раздела с подстрокой-средней,
 * сводная колонка «Все разборы» (cell.n с оценкой типа). Общая сборка
 * матрицы — ai-matrix-table.util.
 */

export const AI_SECTIONS_MATRIX_CODE = 'ai-sections-matrix';

/** Сводная колонка: все разборы типа (cell.n, подстрока — оценка типа). */
export const AI_SECTIONS_MATRIX_ALL: AiMatrixColumn = {
    code: 'all',
    name: 'Все разборы',
};

/** Раздел рубрики в матрице: код и заголовок из DTO (cell.sections[].title). */
export interface AiMatrixSection {
    code: string;
    title: string;
}

export interface AiSectionsMatrixTable extends AiMatrixTable {
    sections: AiMatrixSection[];
}

const rowsOfType = (
    rows: AiByTypeWideRow[],
    callType: string,
): AiByTypeWideRow[] => rows.filter(row => row.cell.callType === callType);

/** Разделы рубрики типа: порядок первой строки с разделами, далее объединение по остальным. */
export const aiMatrixSections = (
    rows: AiByTypeWideRow[],
    callType: string,
): AiMatrixSection[] => {
    const sections = new Map<string, AiMatrixSection>();
    for (const row of rowsOfType(rows, callType)) {
        for (const section of row.cell.sections) {
            if (!sections.has(section.section)) {
                sections.set(section.section, {
                    code: section.section,
                    title: section.title,
                });
            }
        }
    }
    return [...sections.values()];
};

const sectionsCell: AiMatrixCellOf = (group, column) => {
    const cell = group.rows[0]?.cell;
    if (!cell) return AI_MATRIX_EMPTY_CELL;
    if (column.code === AI_SECTIONS_MATRIX_ALL.code) {
        return {
            value: cell.n,
            annotation: aiMatrixScoreAnnotation(cell.score, cell.n),
        };
    }
    const section = cell.sections.find(item => item.section === column.code);
    return section
        ? {
              value: section.n,
              annotation: aiMatrixSectionAnnotation(
                  section.avgScore,
                  section.n,
              ),
          }
        : AI_MATRIX_EMPTY_CELL;
};

/** Строки — менеджеры, колонки — разделы типа (n + средняя) и «Все разборы» (cell.n + оценка типа). */
export const buildAiSectionsMatrixTable = (
    rows: AiByTypeWideRow[],
    callType: string,
    options: AiMatrixManagerOptions,
): AiSectionsMatrixTable => {
    const sections = aiMatrixSections(rows, callType);
    const columns: AiMatrixColumn[] = [
        ...sections.map(section => ({
            code: section.code,
            name: section.title,
        })),
        AI_SECTIONS_MATRIX_ALL,
    ];
    return {
        ...buildAiMatrix(
            AI_SECTIONS_MATRIX_CODE,
            rowsOfType(rows, callType),
            columns,
            options,
            sectionsCell,
        ),
        sections,
    };
};
