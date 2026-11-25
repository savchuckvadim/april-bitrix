import type { RTableRow } from '@workspace/april-ui';
import { isMergedSelected } from './merge-core.util';

/**
 * Что показывать в объединённой таблице. Пустой выбор — без ограничения.
 *
 * selectedUsers приходит только из снимка публичной ссылки (старые снимки
 * несут выбор сотрудников): во фрейме портала сотрудников выбирает главный
 * фильтр отчёта, и здесь выбор всегда пуст. selectedActions — показатели
 * (колонки) таблицы, выбираются рядом с ней.
 */
export interface MergedTableSelection {
    selectedUsers: readonly number[];
    selectedActions: readonly string[];
}

/**
 * Выбран ли сотрудник: пустой выбор — все; иначе сотрудник должен быть в
 * выборе. Строка без id при непустом выборе не проходит.
 */
export const isMergedUserSelected = (
    selectedUsers: readonly number[],
    id: number | undefined,
): boolean =>
    selectedUsers.length === 0 ||
    (id !== undefined && isMergedSelected(selectedUsers, id));

/**
 * Строки объединённой таблицы по выбору: только выбранные сотрудники и в
 * каждой строке только выбранные показатели. Порядок строк и колонок —
 * как в таблице; входные строки не изменяются.
 */
export const selectMergedTableRows = (
    rows: readonly RTableRow[],
    selection: MergedTableSelection,
): RTableRow[] =>
    rows
        .filter(row => isMergedUserSelected(selection.selectedUsers, row.id))
        .map(row => ({
            ...row,
            actions: row.actions.filter(action =>
                isMergedSelected(selection.selectedActions, action.name),
            ),
        }));

/**
 * Названия колонок объединённой таблицы. У всех строк колонки одинаковые
 * (их выравнивает объединение), поэтому берётся первая строка.
 */
export const getMergedColumnNames = (rows: readonly RTableRow[]): string[] =>
    rows[0]?.actions.map(action => action.name) ?? [];

/**
 * Какие колонки отмечены в списке «Колонки». Пустой выбор — «все»:
 * отмечены все колонки таблицы. Названия, которых в таблице нет, не
 * отмечаются.
 */
export const resolveCheckedColumns = (
    columns: readonly string[],
    selectedActions: readonly string[],
): string[] =>
    columns.filter(column => isMergedSelected(selectedActions, column));

/**
 * Выбор показателей, который сохраняется после правки в списке: отмечены
 * все колонки — выбор пуст («все»), иначе — отмеченные в порядке таблицы.
 * Так колонка, появившаяся позже, не пропадёт у того, кто ничего не сужал.
 * Снятая последняя отметка тоже даёт «все»: таблица без колонок не нужна.
 */
export const toSelectedActions = (
    columns: readonly string[],
    checked: readonly string[],
): string[] =>
    columns.every(column => checked.includes(column))
        ? []
        : columns.filter(column => checked.includes(column));
