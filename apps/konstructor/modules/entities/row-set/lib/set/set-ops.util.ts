import type { KRow, RowSet } from '../../model/types';
import { MAX_COMPARISON_SETS } from '../../model/types';

/**
 * Базовые операции и запросы над сетом (замена легаси
 * getUpdatedSetFromNewRow с шестью булевыми флагами).
 */

export const createSet = (id: string, kind: RowSet['kind']): RowSet => ({
    id,
    kind,
    rows: [],
    collapsed: false,
});

/** Добавить/заменить строку. Строки с одинаковым key заменяются. */
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

export const canAddComparisonSet = (alternative: RowSet[]): boolean =>
    alternative.length < MAX_COMPARISON_SETS;

/** Главная garant-строка general-сета (role main) */
export const findMainRow = (set: RowSet): KRow | null =>
    set.rows.find(row => row.role === 'main' && row.productType === 'garant') ??
    null;

/**
 * «Ведущая» garant-строка сета — первая по порядку. У general это main,
 * у comparison-сетов main-строки нет (роль comparison), поэтому сервисные
 * строки и тема сета выводятся от ведущей, а не от findMainRow.
 */
export const leadGarantRow = (set: RowSet): KRow | null =>
    set.rows.find(row => row.productType === 'garant') ?? null;

/** Все garant-строки сета (для мерджа наполнений) */
export const garantRows = (set: RowSet): KRow[] =>
    set.rows.filter(row => row.productType === 'garant');
