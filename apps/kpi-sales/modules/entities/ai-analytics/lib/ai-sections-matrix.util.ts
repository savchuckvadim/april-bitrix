import type {
    AiByTypeWideRow,
    AiCallType,
    AiCellSection,
    AiManagerTypeCell,
    AiTypeTotals,
} from '../model';
import { AI_CALL_SECTION_CODES } from './ai-call-sections.data';
import { AI_CALL_TYPE_ALL } from './ai-call-types.data';
import { aiBucketOfType } from './ai-matrix-buckets.util';
import { AI_MATRIX_TEXT } from './ai-matrix.texts';
import { aiWeightedScore } from './ai-matrix-norm.util';
import {
    AI_MATRIX_EMPTY_CELL,
    aiScoreCell,
    buildAiMatrix,
    type AiMatrixBackendTotal,
    type AiMatrixBuildOptions,
    type AiMatrixCell,
    type AiMatrixCellOf,
    type AiMatrixColumn,
    type AiMatrixTable,
} from './ai-matrix-table.util';
import { aiTypeTotalToBackend } from './ai-matrix-totals.util';
import { isAiMetricHidden } from './ai-metric.util';

/*
 * Блок «AI: разделы оценки по типу» (KPI-вид): менеджер × раздел рубрики —
 * средняя раздела крупно, оценённых звонков мелко; колонка «Итог» —
 * оценка типа. По умолчанию — «Все типы» (все виды звонков этапов продаж
 * вместе: разборы разделов суммируются по типам), тип — фильтр. Разделы
 * идут по ходу разговора (AI_CALL_SECTION_CODES), незнакомые — в конце.
 */

export const AI_SECTIONS_MATRIX_CODE = 'ai-sections-matrix';

/** Сводная колонка: оценка типа (или всех типов) и число разборов. */
export const AI_SECTIONS_MATRIX_ALL: AiMatrixColumn = {
    code: 'all',
    name: AI_MATRIX_TEXT.sectionsTotal,
};

/** Раздел рубрики в матрице: код и заголовок из DTO (cell.sections[].title). */
export interface AiMatrixSection {
    code: string;
    title: string;
}

export interface AiSectionsMatrixTable extends AiMatrixTable {
    sections: AiMatrixSection[];
}

export interface AiSectionsMatrixOptions extends AiMatrixBuildOptions {
    /** Справочник типов портала — какие типы входят в «Все типы» (с корзиной). */
    callTypes?: AiCallType[];
}

/** Срез «все типы»: виды звонков этапов продаж (с корзиной); вне корзин — отдельно. */
export const isAiSectionsAllTypes = (callType: string): boolean =>
    callType === AI_CALL_TYPE_ALL;

const cellMatchesType = (
    cell: Pick<AiManagerTypeCell, 'callType'>,
    callType: string,
    callTypes: AiCallType[],
): boolean =>
    isAiSectionsAllTypes(callType)
        ? aiBucketOfType(cell.callType, callTypes) !== null
        : cell.callType === callType;

const rowsOfType = (
    rows: AiByTypeWideRow[],
    callType: string,
    callTypes: AiCallType[],
): AiByTypeWideRow[] =>
    rows.filter(row => cellMatchesType(row.cell, callType, callTypes));

const sectionOrderIndex = (code: string): number => {
    const index = (AI_CALL_SECTION_CODES as readonly string[]).indexOf(code);
    return index === -1 ? AI_CALL_SECTION_CODES.length : index;
};

/** Разделы рубрики по строкам типа (или всех типов) в порядке разговора; незнакомые — в конце. */
export const aiMatrixSections = (
    rows: AiByTypeWideRow[],
    callType: string,
    callTypes: AiCallType[] = [],
): AiMatrixSection[] => {
    const sections = new Map<string, AiMatrixSection>();
    for (const row of rowsOfType(rows, callType, callTypes)) {
        for (const section of row.cell.sections) {
            if (!sections.has(section.section)) {
                sections.set(section.section, {
                    code: section.section,
                    title: section.title,
                });
            }
        }
    }
    return [...sections.values()].sort(
        (a, b) => sectionOrderIndex(a.code) - sectionOrderIndex(b.code),
    );
};

/* ---------- Ячейки ---------- */

const metricPoint = (cell: Pick<AiManagerTypeCell, 'n' | 'score'>) => ({
    n: cell.n,
    score: isAiMetricHidden(cell.score) ? null : cell.score.value,
});

const sectionPoint = (section: AiCellSection) => ({
    n: section.n,
    score: section.n > 0 ? section.avgScore : null,
});

/** Несколько частей → ячейка, сложенная из них (одна часть — её объяснение). */
const composedCell = (
    points: { n: number; score: number | null }[],
    explanation: string | null,
): AiMatrixCell => {
    if (points.length === 1 && points[0]) {
        return aiScoreCell({ ...points[0], explanation });
    }
    const weighted = aiWeightedScore(points);
    return aiScoreCell({
        n: weighted.n,
        score: weighted.score,
        partial: weighted.score !== null && weighted.scoredN < weighted.n,
        composed: true,
    });
};

const sectionsCellOf =
    (callType: string, callTypes: AiCallType[]): AiMatrixCellOf =>
    (group, column): AiMatrixCell => {
        const cells = rowsOfType(group.rows, callType, callTypes).map(
            row => row.cell,
        );
        if (!cells.length) return AI_MATRIX_EMPTY_CELL;
        if (column.code === AI_SECTIONS_MATRIX_ALL.code) {
            return composedCell(
                cells.map(metricPoint),
                cells[0]?.explanation?.text || null,
            );
        }
        const parts = cells.flatMap(cell =>
            cell.sections.filter(section => section.section === column.code),
        );
        if (!parts.length) return AI_MATRIX_EMPTY_CELL;
        return composedCell(
            parts.map(sectionPoint),
            parts[0]?.explanation?.text || null,
        );
    };

/** Колонки матрицы разделов: разделы по ходу разговора + «Итог». */
export const aiSectionsMatrixColumns = (
    sections: AiMatrixSection[],
): AiMatrixColumn[] => [
    ...sections.map(section => ({ code: section.code, name: section.title })),
    AI_SECTIONS_MATRIX_ALL,
];

/** Строки — менеджеры, колонки — разделы типа (средняя + оценённых) и «Итог». */
export const buildAiSectionsMatrixTable = (
    rows: AiByTypeWideRow[],
    callType: string,
    options: AiSectionsMatrixOptions,
): AiSectionsMatrixTable => {
    const callTypes = options.callTypes ?? [];
    const sections = aiMatrixSections(rows, callType, callTypes);
    return {
        ...buildAiMatrix(
            AI_SECTIONS_MATRIX_CODE,
            rowsOfType(rows, callType, callTypes),
            aiSectionsMatrixColumns(sections),
            options,
            sectionsCellOf(callType, callTypes),
        ),
        sections,
    };
};

/* ---------- Итоги с бэка и важность разделов ---------- */

const totalsOfType = (
    totalsByType: AiTypeTotals[],
    callType: string,
    callTypes: AiCallType[],
): AiTypeTotals[] =>
    totalsByType.filter(total => cellMatchesType(total, callType, callTypes));

/**
 * Итоги колонок из totalsByType: один тип — его итог и разделы как есть;
 * «все типы» — сумма разборов и взвешенная оценка по типам с корзиной.
 */
export const aiSectionsBackendTotals = (
    totalsByType: AiTypeTotals[] | null,
    callType: string,
    columns: AiMatrixColumn[],
    callTypes: AiCallType[] = [],
): Map<string, AiMatrixBackendTotal> => {
    const result = new Map<string, AiMatrixBackendTotal>();
    if (!totalsByType) return result;
    const totals = totalsOfType(totalsByType, callType, callTypes);
    if (!totals.length) return result;
    const single = totals.length === 1 ? totals[0] : undefined;
    for (const column of columns) {
        if (column.code === AI_SECTIONS_MATRIX_ALL.code) {
            if (single) {
                result.set(column.code, aiTypeTotalToBackend(single));
            } else {
                const weighted = aiWeightedScore(totals.map(metricPoint));
                result.set(column.code, {
                    n: weighted.n,
                    score: weighted.score,
                    partial: weighted.score !== null && weighted.scoredN < weighted.n,
                });
            }
            continue;
        }
        const parts = totals.flatMap(total =>
            total.sections.filter(section => section.section === column.code),
        );
        if (!parts.length) continue;
        const weighted = aiWeightedScore(parts.map(sectionPoint));
        result.set(column.code, {
            n: weighted.n,
            score: weighted.score,
            ...(single && parts[0]?.explanation?.text
                ? { explanation: parts[0].explanation.text }
                : {}),
        });
    }
    return result;
};

/** Средняя важность раздела для типа (0–100) по итогам бэка; «все типы» — взвешенно по n. */
export const aiSectionsRelevance = (
    totalsByType: AiTypeTotals[] | null,
    callType: string,
    callTypes: AiCallType[] = [],
): Map<string, number> => {
    const result = new Map<string, number>();
    if (!totalsByType) return result;
    const acc = new Map<string, { sum: number; n: number }>();
    for (const total of totalsOfType(totalsByType, callType, callTypes)) {
        for (const section of total.sections) {
            if (section.n <= 0) continue;
            const item = acc.get(section.section) ?? { sum: 0, n: 0 };
            item.sum += section.avgRelevance * section.n;
            item.n += section.n;
            acc.set(section.section, item);
        }
    }
    for (const [code, item] of acc) {
        result.set(code, Math.round(item.sum / item.n));
    }
    return result;
};
