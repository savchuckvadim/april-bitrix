/**
 * Колонки планов в таблицах отчёта (RTable) и в их итоговых таблицах.
 * Вызывается ПОСЛЕ отбора колонок и своих названий: колонка плана
 * встаёт вплотную слева от факта, связь — по коду колонки факта.
 */
import type { RTableAction, RTableRow } from '@workspace/april-ui';
import type { IndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import type { PlanAchievementRow } from './plan-achievement.util';
import {
    PLAN_COLUMN_CELL_CLASS,
    PLAN_COLUMN_EMPTY_TEXT,
    PLAN_COLUMN_HEADER_CLASS,
} from './plan-columns.consts';
import {
    insertPlanColumns,
    planCellValue,
    planColumnHint,
    planColumnLabel,
    planTotalValue,
    type PlanColumnSpec,
    type PlanColumnValue,
} from './plan-columns.util';

/** Текст ячейки вместо числа: «—» без плана, пусто вне области видимости. */
const planDisplay = (value: PlanColumnValue): string | undefined => {
    if (value === null) return PLAN_COLUMN_EMPTY_TEXT;
    if (value === undefined) return '';
    return undefined;
};

/**
 * Колонка плана для RTable: код `plan:<код>` (не совпадает с кодом факта —
 * аннотации и подсказки факта к ней не цепляются), плановая подсветка
 * шапки и ячейки, подсказка шапки — к какому показателю план.
 */
export const planTableColumn = (
    spec: PlanColumnSpec,
    fact: Pick<RTableAction, 'name'>,
    value: PlanColumnValue,
    labelOf: IndicatorLabeler,
): RTableAction => {
    const column: RTableAction = {
        name: planColumnLabel(spec, fact.name, labelOf),
        code: spec.labelKey,
        value: value ?? 0,
        headerClassName: PLAN_COLUMN_HEADER_CLASS,
        cellClassName: PLAN_COLUMN_CELL_CLASS,
        headerHint: planColumnHint(spec, fact.name, labelOf),
    };
    const display = planDisplay(value);
    return display === undefined ? column : { ...column, display };
};

/**
 * Строки таблицы с колонками планов. План — по строке сотрудника из
 * достижения области видимости; строки нет — пустая ячейка.
 */
export const withPlanTableColumns = (
    rows: readonly RTableRow[],
    specs: readonly PlanColumnSpec[],
    achievement: ReadonlyMap<number, PlanAchievementRow>,
    labelOf: IndicatorLabeler,
): RTableRow[] =>
    rows.map(row => {
        const userRow =
            row.id === undefined ? undefined : achievement.get(row.id);
        return {
            ...row,
            actions: insertPlanColumns(
                row.actions,
                action => action.code,
                specs,
                (spec, fact) =>
                    planTableColumn(
                        spec,
                        fact,
                        planCellValue(spec, userRow),
                        labelOf,
                    ),
            ),
        };
    });

/**
 * Колонки итоговой таблицы с итогом плана слева от итога факта: сумма
 * планов сотрудников userIds из области видимости.
 */
export const withPlanTotalColumns = (
    columns: readonly RTableAction[],
    userIds: readonly number[],
    specs: readonly PlanColumnSpec[],
    achievement: ReadonlyMap<number, PlanAchievementRow>,
    labelOf: IndicatorLabeler,
): RTableAction[] => {
    const rows = [...new Set(userIds)].map(userId => achievement.get(userId));
    return insertPlanColumns(
        columns,
        column => column.code,
        specs,
        (spec, fact) =>
            planTableColumn(spec, fact, planTotalValue(spec, rows), labelOf),
    );
};
