import { replaceClientRegion, compositionRegionCodes } from '../../../composition';
import type { KRow, RowSet } from '../../model/types';

/**
 * Смена региона клиента в наполнениях: старый регион клиента, если он стоит в
 * составе строки, заменяется новым (см. replaceClientRegion). Строки без
 * наполнения и составы без старого региона остаются теми же объектами.
 */

export const replaceClientRegionInRow = (row: KRow, from: string, to: string): KRow => {
    if (!row.composition) return row;
    const composition = replaceClientRegion(row.composition, from, to);
    return composition === row.composition ? row : { ...row, composition };
};

export const replaceClientRegionInSet = (set: RowSet, from: string, to: string): RowSet => {
    const rows = set.rows.map(row => replaceClientRegionInRow(row, from, to));
    return rows.some((row, index) => row !== set.rows[index]) ? { ...set, rows } : set;
};

/** Сколько garant-строк наборов держат этот регион в составе (для подсказки менеджеру) */
export const countRowsWithRegion = (sets: RowSet[], code: string): number =>
    sets
        .flatMap(set => set.rows)
        .filter(row => row.composition && compositionRegionCodes(row.composition).includes(code)).length;
