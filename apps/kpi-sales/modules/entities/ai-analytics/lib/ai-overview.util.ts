import type { SalesDepartment } from '@/modules/entities/department/model';
import {
    buildDepartmentSections,
    buildGroupSections,
    filterSectionsByPresent,
    type StructureSection,
} from '@/modules/entities/department/lib/utils/structure-sections.util';
import type {
    AiBucket,
    AiBucketScore,
    AiCellKpi,
    AiCellSection,
    AiManagerRow,
    AiManagerTypeCell,
    AiMetric,
} from '../model';
import { AI_CHECKLIST_LABELS, AI_WIDE_SECTIONS_MAX } from './ai-overview.data';
import { formatAiCount } from './ai-finance.util';

type AiChecklistKey = keyof typeof AI_CHECKLIST_LABELS;

/** Секция таблицы сигналов: отдел/группа + строки менеджеров. */
export interface AiRowsSection {
    id: string;
    name: string;
    rows: AiManagerRow[];
}

const OUTSIDE_SECTION: Pick<AiRowsSection, 'id' | 'name'> = {
    id: 'outside',
    name: 'Вне структуры',
};

/**
 * Порядок строк внутри секции: сначала с сигналом (по рангу), затем по
 * ключевой цифре (ниже оценка — выше), без оценки — в конец.
 */
export const sortAiRows = (rows: AiManagerRow[]): AiManagerRow[] =>
    [...rows].sort((a, b) => {
        if (a.signal && b.signal) return a.signal.rank - b.signal.rank;
        if (a.signal || b.signal) return a.signal ? -1 : 1;
        const av = a.keyMetric.value;
        const bv = b.keyMetric.value;
        if (av === null && bv === null)
            return b.analyzedCalls - a.analyzedCalls;
        if (av === null || bv === null) return av === null ? 1 : -1;
        return av - bv;
    });

/**
 * Группировка строк обзора по структуре как в других таблицах отчёта:
 * группы (если есть) → отделы (мультипортал) → одна плоская секция.
 * Менеджеры, которых нет в структуре, — секция «Вне структуры».
 */
export const groupAiRows = (
    rows: AiManagerRow[],
    departments: SalesDepartment[],
    isMulti: boolean,
): AiRowsSection[] => {
    const byId = new Map(rows.map(row => [Number(row.managerId), row]));
    const present = new Set(byId.keys());
    const hasGroups = departments.some(dep => dep.groups.length > 0);

    let sections: StructureSection[] = [];
    if (hasGroups) sections = buildGroupSections(departments, isMulti);
    else if (isMulti || departments.length > 1) {
        sections = buildDepartmentSections(departments);
    }
    sections = filterSectionsByPresent(sections, present);

    const placed = new Set<number>();
    const result: AiRowsSection[] = sections.map(section => {
        section.userIds.forEach(id => placed.add(id));
        return {
            id: section.id,
            name: section.name,
            rows: sortAiRows(
                section.userIds
                    .map(id => byId.get(id))
                    .filter((row): row is AiManagerRow => row !== undefined),
            ),
        };
    });

    const rest = rows.filter(row => !placed.has(Number(row.managerId)));
    if (rest.length) {
        result.push({
            ...(result.length ? OUTSIDE_SECTION : { id: 'all', name: '' }),
            rows: sortAiRows(rest),
        });
    }
    return result;
};

/** Оценка корзины строки; нет корзины — null. */
export const aiBucketScore = (
    row: AiManagerRow,
    bucket: AiBucket,
): AiBucketScore | null =>
    row.buckets.find(item => item.bucket === bucket) ?? null;

/**
 * 2–4 показателя типа для широкой раскладки: разделы рубрики с наибольшей
 * применимостью (avgRelevance), при равенстве — с большим n.
 */
export const pickAiCellSections = (
    cell: AiManagerTypeCell,
    max: number = AI_WIDE_SECTIONS_MAX,
): AiCellSection[] =>
    [...cell.sections]
        .sort((a, b) => b.avgRelevance - a.avgRelevance || b.n - a.n)
        .slice(0, max);

/** Id опорных звонков ячейки без null: best/worst/median → строки. */
export const aiEvidenceEntries = (
    cell: AiManagerTypeCell,
): { label: string; transcriptionId: string }[] => {
    const { best, worst, median } = cell.explanation.evidenceCallIds;
    return [
        { label: 'Лучший', transcriptionId: best },
        { label: 'Худший', transcriptionId: worst },
        { label: 'Медианный', transcriptionId: median },
    ].filter(
        (item): item is { label: string; transcriptionId: string } =>
            item.transcriptionId !== null,
    );
};

/** KPI ячейки без главного (он уже в своей колонке). */
export const aiRestKpi = (cell: AiManagerTypeCell): AiCellKpi[] =>
    cell.kpi.filter(item => item.code !== cell.primaryKpi?.code);

/** KPI строкой: «code: факт / план CRM» либо причина отсутствия факта. */
export const formatAiKpiLine = (kpi: AiCellKpi): string => {
    if (kpi.fact === null)
        return `${kpi.code}: — (${kpi.reason ?? 'нет факта'})`;
    const plan =
        kpi.planCrm !== undefined ? ` / ${formatAiCount(kpi.planCrm)}` : '';
    return `${kpi.code}: ${formatAiCount(kpi.fact)}${plan}`;
};

/** Подсказка к главному KPI: план CRM и план руководителя. */
export const aiKpiHintLines = (kpi: AiCellKpi): string[] => [
    kpi.planCrm !== undefined
        ? `План CRM: ${formatAiCount(kpi.planCrm)}`
        : 'Плана CRM нет',
    kpi.planHead !== undefined
        ? `План руководителя: ${formatAiCount(kpi.planHead)}`
        : 'Плана руководителя нет',
];

/** Чек-листы ячейки, которые пришли (подпись + метрика в %). */
export const aiCellChecklistEntries = (
    cell: AiManagerTypeCell,
): { key: AiChecklistKey; label: string; metric: AiMetric }[] =>
    (Object.keys(AI_CHECKLIST_LABELS) as AiChecklistKey[]).flatMap(key => {
        const value = cell.checklists[key];
        return value
            ? [{ key, label: AI_CHECKLIST_LABELS[key], metric: value }]
            : [];
    });

/** Подсказка к разделу рубрики в широкой раскладке. */
export const aiSectionHintLines = (section: AiCellSection): string[] => [
    section.explanation.text,
    `Применимость ${Math.round(section.avgRelevance)} %, n = ${section.n}.`,
];
