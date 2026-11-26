/**
 * Колонки планов в строках основного листа Excel: колонка плана
 * (`kind: 'plan'`, заметка к шапке) вплотную перед колонкой своего факта
 * (`kpi.id === factKey`). Вызывается ПОСЛЕДНИМ шагом — после отбора
 * колонок и своих названий: план уходит вместе со скрытым фактом.
 * Оформление (заливка, «—» без плана, итог — сумма) делает бэк.
 */
import type { IndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import type { PlanAchievementRow } from '../../plans/lib/plan-achievement.util';
import {
    insertPlanColumns,
    planCellValue,
    planColumnHint,
    planColumnLabel,
    type PlanColumnSpec,
} from '../../plans/lib/plan-columns.util';
import {
    EXCEL_KPI_ITEM_KIND,
    type ExcelReportColumn,
    type ExcelReportRow,
} from '../model/excel-report.types';

/**
 * Строки Excel с колонками планов. План — по строке сотрудника из
 * достижения области видимости; плана нет или сотрудник вне области
 * видимости (рядовой видит только свой план) — `count: null`.
 */
export const withExcelPlanColumns = (
    rows: readonly ExcelReportRow[],
    specs: readonly PlanColumnSpec[],
    achievement: ReadonlyMap<number, PlanAchievementRow>,
    labelOf: IndicatorLabeler,
): ExcelReportRow[] =>
    rows.map(row => {
        const userRow = achievement.get(row.id);
        return {
            ...row,
            kpi: insertPlanColumns<ExcelReportColumn>(
                row.kpi,
                kpi => kpi.id,
                specs,
                (spec, fact) => ({
                    id: spec.labelKey,
                    action: planColumnLabel(spec, fact.action, labelOf),
                    count: planCellValue(spec, userRow) ?? null,
                    kind: EXCEL_KPI_ITEM_KIND.plan,
                    note: planColumnHint(spec, fact.action, labelOf),
                }),
            ),
        };
    });

/** Есть ли в строках колонки планов (тогда строки «— план» не нужны). */
export const hasExcelPlanColumns = (rows: readonly ExcelReportRow[]): boolean =>
    rows.some(row =>
        row.kpi.some(kpi => kpi.kind === EXCEL_KPI_ITEM_KIND.plan),
    );
