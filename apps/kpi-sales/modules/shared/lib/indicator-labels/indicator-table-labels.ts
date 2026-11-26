import type { RTableAction, RTableProps, RTableRow } from '@workspace/april-ui';
import { columnLabelKey } from './indicator-label-keys';
import type { IndicatorLabeler } from './indicator-labeler';

/**
 * Выводимое название колонки таблицы показателей по её коду (innerCode
 * события или id бакета звонков). Колонка без кода остаётся как есть:
 * по названию у неё сопоставляются подсказки шапки.
 */
export const indicatorColumnLabel = (
    action: Pick<RTableAction, 'name' | 'code'>,
    labelOf: IndicatorLabeler,
): string =>
    action.code === undefined
        ? action.name
        : labelOf(columnLabelKey(action.code), action.name);

/**
 * Строки таблицы для показа: у показателей — выводимые названия. Только
 * последним шагом, после всех отборов по названию; значения, коды и
 * порядок не меняются, входные строки не изменяются.
 */
export const labelTableRows = (
    rows: readonly RTableRow[],
    labelOf: IndicatorLabeler,
): RTableRow[] =>
    rows.map(row => ({
        ...row,
        actions: row.actions.map(action => ({
            ...action,
            name: indicatorColumnLabel(action, labelOf),
        })),
    }));

/** Таблица для показа и CSV: строки с выводимыми названиями показателей. */
export const labelTableData = (
    table: RTableProps,
    labelOf: IndicatorLabeler,
): RTableProps => ({
    ...table,
    data: labelTableRows(table.data, labelOf),
});
