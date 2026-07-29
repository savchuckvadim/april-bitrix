'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    buildTotalRow,
    rowSetActions,
    selectEditingSetId,
    selectRowSetContext,
    type RowSet,
} from '@/modules/entities/row-set';
import { formatSetSummary } from '../../lib/format-set-summary.util';

/**
 * Логика блока сета: merge/unmerge, режим редактирования при свёрнутом
 * виде («карандаш»), сводка, удаление comparison-сета, явный пересчёт
 * по текущим ценам (для восстановленных слепков).
 */
export const useSetBlock = (set: RowSet) => {
    const dispatch = useAppDispatch();
    const context = useAppSelector(selectRowSetContext);
    const editingSetId = useAppSelector(selectEditingSetId);

    const total = buildTotalRow(set);
    const garantCount = set.rows.filter(
        row => row.productType === 'garant',
    ).length;

    const toggleCollapsed = () =>
        dispatch(rowSetActions.toggleCollapsed({ setId: set.id }));

    const toggleEditing = () =>
        dispatch(
            editingSetId === set.id
                ? rowSetActions.stopSetEditing()
                : rowSetActions.startSetEditing({ setId: set.id }),
        );

    const removeSet = () =>
        dispatch(rowSetActions.removeComparisonSet({ setId: set.id }));

    const resync = () => dispatch(rowSetActions.resyncSet({ setId: set.id }));

    return {
        total,
        garantCount,
        summary: formatSetSummary(set, context.withTax),
        canMerge: set.rows.length > 1,
        isEditing: editingSetId === set.id,
        isBlurred: editingSetId !== null && editingSetId !== set.id,
        toggleCollapsed,
        toggleEditing,
        removeSet,
        resync,
    };
};
