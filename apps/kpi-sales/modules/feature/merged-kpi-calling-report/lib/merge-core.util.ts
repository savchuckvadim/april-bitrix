import { getIsFiltredKpiReportForMergedReport } from '@/modules/shared/lib/merged-actions.util';

/**
 * Общее ядро объединённого отчёта (события + звонки). Не зависит от формы
 * строки: экран работает со строками таблицы, Excel — со строками DTO для
 * сервера, а состав сотрудников и колонок считается здесь один раз.
 */

/** Как читать строку отчёта по сотруднику и её показатели (ячейки). */
export interface MergedRowAdapter<TRow, TCell> {
    /** Id сотрудника. Нет числа — строка не склеивается ни с какой другой. */
    idOf: (row: TRow) => number | undefined;
    cellsOf: (row: TRow) => readonly TCell[];
    /** Название показателя — ключ колонки. */
    nameOf: (cell: TCell) => string;
    /** Нулевая ячейка для колонки, значения которой у сотрудника нет. */
    zeroOf: (column: TCell) => TCell;
}

/** Из какого источника брать шапку строки (id, имя), когда сотрудник есть в обоих. */
export type MergedHeaderSource = 'calling' | 'kpi';

/** Сотрудник объединённого отчёта: шапка и ячейки по общим колонкам. */
export interface MergedUserRow<TRow, TCell> {
    row: TRow;
    /** Сначала колонки звонков, затем колонки событий; у всех сотрудников одинаковые. */
    cells: TCell[];
}

interface UserSlot<TRow> {
    head: TRow;
    calling?: TRow;
    kpi?: TRow;
}

const isUserId = (id: number | undefined): id is number =>
    id !== undefined && Number.isFinite(id);

/**
 * Сотрудники из обоих источников: сначала в порядке строк звонков, затем те,
 * кто есть только в событиях (в порядке событий). Повтор сотрудника внутри
 * одного источника игнорируется — остаётся первая строка.
 */
const joinUsers = <TRow>(
    callingRows: readonly TRow[],
    kpiRows: readonly TRow[],
    idOf: (row: TRow) => number | undefined,
    headerFrom: MergedHeaderSource,
): UserSlot<TRow>[] => {
    const slots: UserSlot<TRow>[] = [];
    const slotById = new Map<number, UserSlot<TRow>>();

    callingRows.forEach(row => {
        const id = idOf(row);
        if (isUserId(id) && slotById.has(id)) return;
        const slot: UserSlot<TRow> = { head: row, calling: row };
        slots.push(slot);
        if (isUserId(id)) slotById.set(id, slot);
    });

    kpiRows.forEach(row => {
        const id = idOf(row);
        const slot = isUserId(id) ? slotById.get(id) : undefined;
        if (!slot) {
            const created: UserSlot<TRow> = { head: row, kpi: row };
            slots.push(created);
            if (isUserId(id)) slotById.set(id, created);
            return;
        }
        if (slot.kpi !== undefined) return;
        slot.kpi = row;
        if (headerFrom === 'kpi') slot.head = row;
    });

    return slots;
};

/**
 * Колонки по первому появлению, без дублей по названию. taken — названия,
 * уже занятые другим источником (такая колонка остаётся за ним).
 */
const collectColumns = <TCell>(
    cellLists: readonly (readonly TCell[])[],
    nameOf: (cell: TCell) => string,
    taken: ReadonlySet<string> = new Set(),
): TCell[] => {
    const seen = new Set(taken);
    const columns: TCell[] = [];
    cellLists.forEach(cells =>
        cells.forEach(cell => {
            const name = nameOf(cell);
            if (seen.has(name)) return;
            seen.add(name);
            columns.push(cell);
        }),
    );
    return columns;
};

/** Ячейки сотрудника по колонкам: своё значение или ноль. */
const alignCells = <TRow, TCell>(
    columns: readonly TCell[],
    row: TRow | undefined,
    adapter: MergedRowAdapter<TRow, TCell>,
): TCell[] => {
    const cells = row === undefined ? [] : adapter.cellsOf(row);
    return columns.map(
        column =>
            cells.find(cell => adapter.nameOf(cell) === adapter.nameOf(column)) ??
            adapter.zeroOf(column),
    );
};

/**
 * Объединяет строки звонков и событий по сотруднику: состав — сотрудники
 * из обоих источников, колонки — показатели звонков, затем показатели
 * событий (только допустимые для объединённого отчёта и без названий,
 * уже занятых звонками). Чего у сотрудника нет — ноль. Входные строки
 * не изменяются.
 */
export const mergeRowsByUser = <TRow, TCell>(
    callingRows: readonly TRow[],
    kpiRows: readonly TRow[],
    adapter: MergedRowAdapter<TRow, TCell>,
    headerFrom: MergedHeaderSource,
): MergedUserRow<TRow, TCell>[] => {
    const { cellsOf, nameOf } = adapter;
    const callingColumns = collectColumns(callingRows.map(cellsOf), nameOf);
    const kpiColumns = collectColumns(
        kpiRows.map(row =>
            cellsOf(row).filter(cell =>
                getIsFiltredKpiReportForMergedReport(nameOf(cell)),
            ),
        ),
        nameOf,
        new Set(callingColumns.map(nameOf)),
    );

    return joinUsers(callingRows, kpiRows, adapter.idOf, headerFrom).map(
        slot => ({
            row: slot.head,
            cells: [
                ...alignCells(callingColumns, slot.calling, adapter),
                ...alignCells(kpiColumns, slot.kpi, adapter),
            ],
        }),
    );
};

/** Выбран ли элемент выбором объединённого отчёта: пустой выбор — без ограничения. */
export const isMergedSelected = <T>(
    selected: readonly T[],
    value: T,
): boolean => selected.length === 0 || selected.includes(value);
