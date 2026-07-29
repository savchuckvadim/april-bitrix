import { buildTotalRow, findMainRow } from '../lib/set';
import type { KRow } from './types';
import type { RowSetState } from './RowSetSlice';

/**
 * Селекторы row-set. Типизация структурная (WithRowSet) — entity не тянет
 * RootState; срез подключён в store под ключом `rowSet`.
 */
interface WithRowSet {
    rowSet: RowSetState;
}

export const selectGeneralSet = (state: WithRowSet) => state.rowSet.general;
export const selectAlternativeSets = (state: WithRowSet) =>
    state.rowSet.alternative;
export const selectSelectedRow = (state: WithRowSet): KRow | null => {
    const key = state.rowSet.selectedRowKey;
    if (!key) return null;
    const all = [state.rowSet.general, ...state.rowSet.alternative];
    for (const set of all) {
        const row = set.rows.find(item => item.key === key);
        if (row) return row;
    }
    return null;
};
export const selectGeneralTotal = (state: WithRowSet) =>
    buildTotalRow(state.rowSet.general);
export const selectRowSetContext = (state: WithRowSet) =>
    state.rowSet.context;
export const selectMainRow = (state: WithRowSet) =>
    findMainRow(state.rowSet.general);
export const selectEditingSetId = (state: WithRowSet) =>
    state.rowSet.editingSetId;
