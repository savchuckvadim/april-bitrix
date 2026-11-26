import type { RTableRow } from '@workspace/april-ui';
import {
    indicatorColumnLabel,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import { isMergedSelected } from './merge-core.util';

/**
 * Показ объединённого отчёта со своими названиями. Колонки объединённой
 * таблицы сопоставляются и выбираются по ИСХОДНЫМ названиям (так хранится
 * выбор «Колонки»), поэтому строки остаются с исходными названиями, а
 * выводимое название берётся отсюда по коду колонки.
 */

/**
 * Выводимые названия колонок: исходное название → своё по коду колонки
 * (первая строка — у всех строк колонки одинаковые).
 */
export const getMergedColumnLabels = (
    rows: readonly RTableRow[],
    labelOf: IndicatorLabeler,
): Map<string, string> =>
    new Map(
        (rows[0]?.actions ?? []).map(action => [
            action.name,
            indicatorColumnLabel(action, labelOf),
        ]),
    );

/** Колонка итога объединённой таблицы. */
export interface MergedTotalColumn {
    /** Выводимое название. */
    name: string;
    value: number;
}

/**
 * Итог по колонкам объединённой таблицы: колонки по выбору (пустой — все;
 * сравнение по исходным названиям), сумма значений всех сотрудников.
 */
export const getMergedTotalColumns = (
    rows: readonly RTableRow[],
    selectedActions: readonly string[],
    labelOf: IndicatorLabeler,
): MergedTotalColumn[] =>
    (rows[0]?.actions ?? [])
        .filter(action => isMergedSelected(selectedActions, action.name))
        .map(action => ({
            name: indicatorColumnLabel(action, labelOf),
            value: rows.reduce(
                (sum, row) =>
                    sum +
                    (row.actions.find(cell => cell.name === action.name)?.value || 0),
                0,
            ),
        }));
