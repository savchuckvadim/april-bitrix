import type { RowSet } from '../../model/types';

/** ≤1 строки — сворачивать нечего: авторазворот + сброс ручного тотала (легаси-правило) */
export const normalizeCollapsed = (set: RowSet): RowSet =>
    set.rows.length <= 1 && (set.collapsed || set.totalPrice)
        ? { ...set, collapsed: false, totalPrice: null }
        : set;

/**
 * Удаление строки с каскадом: последняя garant-строка убивает сет (null) —
 * сервисные строки без гаранта не живут (легаси getUpdatedSetFromDeleteRow).
 */
export const removeRowCascade = (set: RowSet, key: string): RowSet | null => {
    const removed = set.rows.find(row => row.key === key);
    if (!removed) return set;
    const rows = set.rows.filter(row => row.key !== key);
    if (
        removed.productType === 'garant' &&
        !rows.some(row => row.productType === 'garant')
    ) {
        return null;
    }
    return normalizeCollapsed({ ...set, rows });
};
