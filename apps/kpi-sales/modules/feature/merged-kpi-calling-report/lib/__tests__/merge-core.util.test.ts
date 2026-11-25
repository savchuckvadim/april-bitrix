import { describe, expect, it } from 'vitest';
import {
    isMergedSelected,
    mergeRowsByUser,
    type MergedRowAdapter,
} from '../merge-core.util';

/** Простая строка для проверки ядра независимо от форм экрана и Excel. */
interface Cell {
    name: string;
    value: number;
}
interface Row {
    id?: number;
    label: string;
    cells: Cell[];
}

const ADAPTER: MergedRowAdapter<Row, Cell> = {
    idOf: row => row.id,
    cellsOf: row => row.cells,
    nameOf: cell => cell.name,
    zeroOf: ({ name }) => ({ name, value: 0 }),
};

const row = (id: number | undefined, label: string, cells: Cell[]): Row => ({
    id,
    label,
    cells,
});

const cell = (name: string, value: number): Cell => ({ name, value });

describe('mergeRowsByUser', () => {
    it('сотрудники: сначала звонки по порядку, затем только из событий', () => {
        const callings = [row(2, 'c2', []), row(1, 'c1', [])];
        const kpis = [row(1, 'k1', []), row(4, 'k4', []), row(3, 'k3', [])];

        const result = mergeRowsByUser(callings, kpis, ADAPTER, 'calling');

        expect(result.map(item => item.row.id)).toEqual([2, 1, 4, 3]);
    });

    it('шапка берётся из выбранного источника, когда сотрудник есть в обоих', () => {
        const callings = [row(1, 'звонки', [])];
        const kpis = [row(1, 'события', [])];

        expect(
            mergeRowsByUser(callings, kpis, ADAPTER, 'calling')[0]?.row.label,
        ).toBe('звонки');
        expect(
            mergeRowsByUser(callings, kpis, ADAPTER, 'kpi')[0]?.row.label,
        ).toBe('события');
    });

    it('сотрудник только в одном источнике: шапка из него при любом выборе', () => {
        const onlyCalling = mergeRowsByUser([row(1, 'звонки', [])], [], ADAPTER, 'kpi');
        const onlyKpi = mergeRowsByUser([], [row(1, 'события', [])], ADAPTER, 'calling');

        expect(onlyCalling[0]?.row.label).toBe('звонки');
        expect(onlyKpi[0]?.row.label).toBe('события');
    });

    it('колонки: звонки, затем события; события без допустимых названий отбрасываются', () => {
        const callings = [row(1, 'c', [cell('Звонки > 30 сек', 5), cell('Наборов номера', 9)])];
        const kpis = [
            row(1, 'k', [
                cell('План', 1),
                cell('Результативные', 2),
                cell('Звонок совершен', 3),
                cell('Презентация', 4),
                cell('Звонки > 30 сек', 99),
            ]),
        ];

        const [merged] = mergeRowsByUser(callings, kpis, ADAPTER, 'calling');

        expect(merged?.cells).toEqual([
            cell('Звонки > 30 сек', 5),
            cell('Наборов номера', 9),
            cell('Презентация', 4),
        ]);
    });

    it('у отсутствующего источника — нули по его колонкам', () => {
        const callings = [row(1, 'c1', [cell('Звонки', 5)])];
        const kpis = [row(2, 'k2', [cell('Презентация', 4)])];

        const result = mergeRowsByUser(callings, kpis, ADAPTER, 'calling');

        expect(result[0]?.cells).toEqual([cell('Звонки', 5), cell('Презентация', 0)]);
        expect(result[1]?.cells).toEqual([cell('Звонки', 0), cell('Презентация', 4)]);
    });

    it('колонка берётся по первому появлению среди всех сотрудников источника', () => {
        const callings = [
            row(1, 'c1', [cell('A', 1)]),
            row(2, 'c2', [cell('A', 2), cell('B', 3)]),
        ];

        const result = mergeRowsByUser(callings, [], ADAPTER, 'calling');

        expect(result.map(item => item.cells)).toEqual([
            [cell('A', 1), cell('B', 0)],
            [cell('A', 2), cell('B', 3)],
        ]);
    });

    it('повтор сотрудника внутри источника игнорируется — остаётся первая строка', () => {
        const callings = [row(1, 'первая', [cell('A', 1)]), row(1, 'вторая', [cell('A', 7)])];

        const result = mergeRowsByUser(callings, [], ADAPTER, 'calling');

        expect(result).toHaveLength(1);
        expect(result[0]?.row.label).toBe('первая');
        expect(result[0]?.cells).toEqual([cell('A', 1)]);
    });

    it('строки без числового id не склеиваются ни друг с другом, ни с другими', () => {
        const callings = [row(undefined, 'c', [cell('A', 1)]), row(Number.NaN, 'cn', [])];
        const kpis = [row(undefined, 'k', [cell('Б', 2)]), row(Number.NaN, 'kn', [])];

        const result = mergeRowsByUser(callings, kpis, ADAPTER, 'calling');

        expect(result.map(item => item.row.label)).toEqual(['c', 'cn', 'k', 'kn']);
    });

    it('входные строки и ячейки не изменяются', () => {
        const callings = [row(1, 'c', [cell('A', 1)])];
        const kpis = [row(2, 'k', [cell('Б', 2)])];
        const before = JSON.stringify({ callings, kpis });

        mergeRowsByUser(callings, kpis, ADAPTER, 'calling');

        expect(JSON.stringify({ callings, kpis })).toBe(before);
    });

    it('оба источника пусты — сотрудников нет', () => {
        expect(mergeRowsByUser([], [], ADAPTER, 'calling')).toEqual([]);
    });

    it('сотрудник без показателей остаётся строкой с одними нулями', () => {
        const callings = [row(1, 'c1', [cell('A', 1)]), row(2, 'c2', [])];

        const result = mergeRowsByUser(callings, [], ADAPTER, 'calling');

        expect(result[1]?.cells).toEqual([cell('A', 0)]);
    });
});

describe('isMergedSelected', () => {
    it('пустой выбор — без ограничения', () => {
        expect(isMergedSelected<number>([], 5)).toBe(true);
        expect(isMergedSelected<string>([], 'любой')).toBe(true);
    });

    it('непустой выбор пропускает только выбранное', () => {
        expect(isMergedSelected([1, 2], 2)).toBe(true);
        expect(isMergedSelected([1, 2], 3)).toBe(false);
        expect(isMergedSelected(['A'], 'Б')).toBe(false);
    });
});
