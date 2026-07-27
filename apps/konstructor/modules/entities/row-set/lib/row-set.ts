import type { KRow, RowSet } from '../model/types';
import { MAX_COMPARISON_SETS } from '../model/types';

/**
 * Явные операции над сетами (замена легаси getUpdatedSetFromNewRow
 * с шестью булевыми флагами).
 */

export const createSet = (
    id: string,
    kind: RowSet['kind'],
): RowSet => ({ id, kind, rows: [], collapsed: false });

/** Добавить/заменить строку. Garant-строки с одинаковым key заменяются. */
export const upsertRow = (set: RowSet, row: KRow): RowSet => {
    const index = set.rows.findIndex(item => item.key === row.key);
    if (index === -1) return { ...set, rows: [...set.rows, row] };
    const rows = [...set.rows];
    rows[index] = row;
    return { ...set, rows };
};

/** Заменить единственную строку типа productType (сервисные строки — по одной на сет) */
export const replaceServiceRow = (set: RowSet, row: KRow): RowSet => {
    const rows = set.rows.filter(item => item.productType !== row.productType);
    return { ...set, rows: [...rows, row] };
};

export const removeRow = (set: RowSet, key: string): RowSet => ({
    ...set,
    rows: set.rows.filter(row => row.key !== key),
});

export const removeByProductType = (
    set: RowSet,
    productType: KRow['productType'],
): RowSet => ({
    ...set,
    rows: set.rows.filter(row => row.productType !== productType),
});

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Свёрнутая total-строка: имена через « + », цены суммируются */
export const buildTotalRow = (set: RowSet): KRow | null => {
    const first = set.rows[0];
    if (!first) return null;

    const total = set.rows.reduce(
        (acc, row) => ({
            base: acc.base + row.price.base,
            current: acc.current + row.price.sum,
            month: acc.month + row.price.month,
        }),
        { base: 0, current: 0, month: 0 },
    );

    return {
        key: `${set.id}_total`,
        setId: set.id,
        role: first.role,
        productType: 'garant',
        refs: first.refs,
        names: {
            name: set.rows.map(row => row.names.name).join(' + '),
            shortName: set.rows.map(row => row.names.shortName).join(' + '),
            alternativeName: null,
        },
        price: {
            base: round2(total.base),
            current: round2(total.current),
            quantity: 1,
            month: round2(total.month),
            sum: round2(total.current),
            measure: first.price.measure,
            discount: {
                percent: 1,
                amount: round2(total.base - total.current),
                current: 'percent',
            },
        },
    };
};

export const canAddComparisonSet = (alternative: RowSet[]): boolean =>
    alternative.length < MAX_COMPARISON_SETS;

/** Главная garant-строка general-сета (role main) */
export const findMainRow = (set: RowSet): KRow | null =>
    set.rows.find(row => row.role === 'main' && row.productType === 'garant') ??
    null;

/** Все garant-строки сета (для мерджа наполнений) */
export const garantRows = (set: RowSet): KRow[] =>
    set.rows.filter(row => row.productType === 'garant');
