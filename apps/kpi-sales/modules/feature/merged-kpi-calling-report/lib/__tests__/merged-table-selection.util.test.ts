import { describe, expect, it } from 'vitest';
import type { RTableRow } from '@workspace/april-ui';
import {
    getMergedColumnNames,
    isMergedUserSelected,
    resolveCheckedColumns,
    selectMergedTableRows,
    toSelectedActions,
} from '../merged-table-selection.util';

/*
 * Отбор строк и колонок объединённой таблицы. Пустой выбор — всё; выбор
 * показателей — только они; выбор сотрудников приходит из снимка публичной
 * ссылки (во фрейме он пуст — сотрудников задаёт главный фильтр).
 */

const row = (id: number | undefined, name: string): RTableRow => ({
    id,
    name,
    actions: [
        { name: 'Звонки', value: id ?? 0 },
        { name: 'Встречи', value: 10 },
        { name: 'Презентации', value: 20 },
    ],
});

const ROWS: RTableRow[] = [row(1, 'Иванов'), row(2, 'Петров'), row(3, 'Сидоров')];

const names = (rows: readonly RTableRow[]) => rows.map(item => item.name);
const columnsOf = (item: RTableRow | undefined) =>
    item?.actions.map(action => action.name);

describe('selectMergedTableRows', () => {
    it('пустой выбор — все сотрудники и все показатели', () => {
        const result = selectMergedTableRows(ROWS, {
            selectedUsers: [],
            selectedActions: [],
        });

        expect(names(result)).toEqual(['Иванов', 'Петров', 'Сидоров']);
        expect(columnsOf(result[0])).toEqual(['Звонки', 'Встречи', 'Презентации']);
    });

    it('выбор показателей — в каждой строке только они, порядок таблицы', () => {
        const result = selectMergedTableRows(ROWS, {
            selectedUsers: [],
            selectedActions: ['Презентации', 'Звонки'],
        });

        expect(names(result)).toEqual(['Иванов', 'Петров', 'Сидоров']);
        result.forEach(item =>
            expect(columnsOf(item)).toEqual(['Звонки', 'Презентации']),
        );
    });

    it('выбор сотрудников из снимка ссылки — только они, все показатели', () => {
        const result = selectMergedTableRows(ROWS, {
            selectedUsers: [3, 1],
            selectedActions: [],
        });

        expect(names(result)).toEqual(['Иванов', 'Сидоров']);
        expect(columnsOf(result[1])).toEqual(['Звонки', 'Встречи', 'Презентации']);
    });

    it('сотрудники и показатели вместе — пересечение', () => {
        const result = selectMergedTableRows(ROWS, {
            selectedUsers: [2],
            selectedActions: ['Встречи'],
        });

        expect(names(result)).toEqual(['Петров']);
        expect(columnsOf(result[0])).toEqual(['Встречи']);
    });

    it('значения и прочие поля строки сохраняются', () => {
        const [result] = selectMergedTableRows(
            [{ ...row(2, 'Петров'), className: 'total' }],
            { selectedUsers: [], selectedActions: ['Звонки'] },
        );

        expect(result).toEqual({
            id: 2,
            name: 'Петров',
            className: 'total',
            actions: [{ name: 'Звонки', value: 2 }],
        });
    });

    it('выбранного сотрудника в таблице нет — строк нет', () => {
        const result = selectMergedTableRows(ROWS, {
            selectedUsers: [99],
            selectedActions: [],
        });

        expect(result).toEqual([]);
    });

    it('входные строки не изменяются', () => {
        const snapshot = JSON.stringify(ROWS);
        selectMergedTableRows(ROWS, {
            selectedUsers: [1],
            selectedActions: ['Звонки'],
        });

        expect(JSON.stringify(ROWS)).toBe(snapshot);
    });
});

describe('isMergedUserSelected', () => {
    it('пустой выбор пропускает всех, даже строку без id', () => {
        expect(isMergedUserSelected([], 5)).toBe(true);
        expect(isMergedUserSelected([], undefined)).toBe(true);
    });

    it('непустой выбор пропускает только выбранных; строка без id не проходит', () => {
        expect(isMergedUserSelected([5], 5)).toBe(true);
        expect(isMergedUserSelected([5], 6)).toBe(false);
        expect(isMergedUserSelected([5], undefined)).toBe(false);
    });
});

describe('getMergedColumnNames', () => {
    it('колонки берутся из первой строки в порядке таблицы', () => {
        expect(getMergedColumnNames(ROWS)).toEqual([
            'Звонки',
            'Встречи',
            'Презентации',
        ]);
    });

    it('таблица пуста — колонок нет', () => {
        expect(getMergedColumnNames([])).toEqual([]);
    });
});

describe('resolveCheckedColumns — отметки в списке «Колонки»', () => {
    const COLUMNS = ['Звонки', 'Встречи', 'Презентации'];

    it('пустой выбор — отмечены все колонки', () => {
        expect(resolveCheckedColumns(COLUMNS, [])).toEqual(COLUMNS);
    });

    it('выбор сужен — отмечены только выбранные, в порядке таблицы', () => {
        expect(
            resolveCheckedColumns(COLUMNS, ['Презентации', 'Звонки']),
        ).toEqual(['Звонки', 'Презентации']);
    });

    it('названия, которых в таблице нет, не отмечаются', () => {
        expect(resolveCheckedColumns(COLUMNS, ['Звонки', 'Старое'])).toEqual([
            'Звонки',
        ]);
    });
});

describe('toSelectedActions — что сохраняется после правки в списке', () => {
    const COLUMNS = ['Звонки', 'Встречи', 'Презентации'];

    it('отмечены все колонки — выбор пуст («все»)', () => {
        expect(toSelectedActions(COLUMNS, [...COLUMNS])).toEqual([]);
    });

    it('«Показать все» (пустой набор) — выбор пуст', () => {
        expect(toSelectedActions(COLUMNS, [])).toEqual([]);
    });

    it('отмечена часть — сохраняются отмеченные в порядке таблицы', () => {
        expect(toSelectedActions(COLUMNS, ['Презентации', 'Звонки'])).toEqual([
            'Звонки',
            'Презентации',
        ]);
    });

    it('снятие одной отметки при «всех» оставляет остальные', () => {
        const checked = resolveCheckedColumns(COLUMNS, []).filter(
            column => column !== 'Встречи',
        );

        expect(toSelectedActions(COLUMNS, checked)).toEqual([
            'Звонки',
            'Презентации',
        ]);
    });

    it('отмеченное, чего нет в таблице, не сохраняется', () => {
        expect(toSelectedActions(COLUMNS, ['Звонки', 'Старое'])).toEqual([
            'Звонки',
        ]);
    });

    it('колонок нет — выбор пуст', () => {
        expect(toSelectedActions([], ['Звонки'])).toEqual([]);
    });
});
