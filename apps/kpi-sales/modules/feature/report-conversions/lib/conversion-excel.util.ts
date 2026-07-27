import type {
    ConversionsExcelDto,
    ConversionsExcelSectionDto,
} from '@workspace/nest-kpi-report-sales-api';
import {
    buildDepartmentSections,
    buildGroupSections,
    type SalesDepartment,
} from '@/modules/entities/department';
import type { ConversionMethod } from '../model/conversion.types';
import type { ConversionResult } from './conversion-calc.util';
import { buildConversionResult } from './conversion-calc.util';
import { CONVERSION_METHOD_LABELS } from './conversion-catalog';

const toFraction = (percent: number | null): number | null =>
    percent === null ? null : percent / 100;

/** Минимум от RatingDataset — то, что нужно для секционного пересчёта. */
interface ConversionDatasetLike {
    actions: { code: string; name: string }[];
    rows: { userId: number; name: string; values: Record<string, number> }[];
}

/** Секция структуры отчёта (отдел/группа) для разбивки листа. */
export interface ConversionExcelSectionSource {
    title: string;
    userIds: number[];
}

/**
 * Источники секций листа из структуры отделов: мульти — отделы + группы
 * с префиксом отдела, моно — только группы (лист-отдел избыточен).
 */
export const buildConversionSectionSources = (
    departments: SalesDepartment[],
    isMulti: boolean,
): ConversionExcelSectionSource[] => [
    ...(isMulti
        ? buildDepartmentSections(departments).map(s => ({
              title: `Отдел: ${s.name}`,
              userIds: s.userIds,
          }))
        : []),
    ...buildGroupSections(departments, isMulti).map(s => ({
        title: `Группа: ${s.name}`,
        userIds: s.userIds,
    })),
];

/**
 * Разбивка листа «Конверсии» по секциям структуры (отделы/группы, как на
 * KPI-листах). Итог секции пересчитывается из сумм числителей/знаменателей
 * по составу секции (buildConversionResult) — НЕ среднее процентов.
 * Пустые секции (нет сотрудников из датасета) отбрасываются.
 */
export const buildConversionsExcelSections = (
    dataset: ConversionDatasetLike,
    codes: string[],
    method: ConversionMethod,
    sections: ConversionExcelSectionSource[],
): ConversionsExcelSectionDto[] =>
    sections
        .map(section => {
            const userIds = new Set(section.userIds);
            const sectionResult = buildConversionResult(
                {
                    actions: dataset.actions,
                    rows: dataset.rows.filter(row => userIds.has(row.userId)),
                },
                codes,
                method,
            );
            if (!sectionResult.rows.length || !sectionResult.stepDefs.length) {
                return null;
            }
            return {
                title: section.title,
                rows: sectionResult.rows.map(row => ({
                    userName: row.name,
                    values: row.steps.map(step => toFraction(step.percent)),
                })),
                total: sectionResult.total.map(step =>
                    toFraction(step.percent),
                ),
            };
        })
        .filter((s): s is ConversionsExcelSectionDto => s !== null);

/**
 * ConversionResult → DTO листа «Конверсии» в Excel.
 * Значения — доли (0.25 = 25%), бэк форматирует как 0.0%; null → «—».
 * sections — опциональная разбивка по отделам/группам (см. выше);
 * reportTypeLabel — подпись листа «Тип отчёта: …» (текущая вкладка).
 */
export const buildConversionsExcelDto = (
    result: ConversionResult,
    method: ConversionMethod,
    sections?: ConversionsExcelSectionDto[],
    reportTypeLabel?: string,
): ConversionsExcelDto => ({
    methodLabel: CONVERSION_METHOD_LABELS[method],
    columns: result.stepDefs.map(def => `${def.fromName} → ${def.toName}`),
    rows: result.rows.map(row => ({
        userName: row.name,
        values: row.steps.map(step => toFraction(step.percent)),
    })),
    total: result.total.map(step => toFraction(step.percent)),
    ...(sections?.length ? { sections } : {}),
    ...(reportTypeLabel ? { reportTypeLabel } : {}),
});
