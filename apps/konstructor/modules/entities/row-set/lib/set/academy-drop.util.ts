import type { RowSet } from '../../model/types';

/**
 * Академия выпала при пересборке (смена договора вне contractLong пакета) —
 * сигнал listener'у почистить composition.academy, чтобы не осталось
 * «призрачного» выбора (чистая замена легаси useAcademyQuantityListener).
 */
export const detectDroppedAcademy = (prev: RowSet, synced: RowSet): boolean =>
    prev.rows.some(row => row.productType === 'academy') &&
    !synced.rows.some(row => row.productType === 'academy');
