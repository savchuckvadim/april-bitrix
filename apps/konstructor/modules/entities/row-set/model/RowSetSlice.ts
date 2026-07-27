import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import type { KRow, RowSet } from './types';
import {
    buildTotalRow,
    canAddComparisonSet,
    createSet,
    removeRow,
    replaceServiceRow,
    upsertRow,
} from '../lib/row-set';
import type { CommercialEdit } from '../lib/pricing';
import { applyCommercialEdit } from '../lib/pricing';
import type { RowSetContext } from '../lib/sync-set';
import type { Composition } from '../../composition';

export interface RowSetState {
    general: RowSet;
    alternative: RowSet[];
    /** Строка, чьё наполнение открыто в редакторе состава */
    selectedRowKey: string | null;
    /** Контекст ценообразования: регион и налог поставщика */
    context: RowSetContext;
}

const initialState: RowSetState = {
    general: createSet('general', 'general'),
    alternative: [],
    selectedRowKey: null,
    context: { regionCode: null, withTax: false },
};

const findSet = (state: RowSetState, setId: string): RowSet | null => {
    if (state.general.id === setId) return state.general;
    return state.alternative.find(set => set.id === setId) ?? null;
};

const writeSet = (state: RowSetState, set: RowSet) => {
    if (state.general.id === set.id) {
        state.general = set;
        return;
    }
    state.alternative = state.alternative.map(item =>
        item.id === set.id ? set : item,
    );
};

const rowSetSlice = createSlice({
    name: 'rowSet',
    initialState,
    reducers: {
        upsertRow(state, action: PayloadAction<KRow>) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            writeSet(state, upsertRow(set, action.payload));
        },
        replaceServiceRow(state, action: PayloadAction<KRow>) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            writeSet(state, replaceServiceRow(set, action.payload));
        },
        removeRow(
            state,
            action: PayloadAction<{ setId: string; key: string }>,
        ) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            writeSet(state, removeRow(set, action.payload.key));
            if (state.selectedRowKey === action.payload.key) {
                state.selectedRowKey = null;
            }
        },
        addComparisonSet: {
            prepare: (id?: string) => ({ payload: { id: id ?? nanoid() } }),
            reducer(state, action: PayloadAction<{ id: string }>) {
                if (!canAddComparisonSet(state.alternative)) return;
                state.alternative.push(
                    createSet(action.payload.id, 'alternative'),
                );
            },
        },
        removeComparisonSet(state, action: PayloadAction<{ setId: string }>) {
            state.alternative = state.alternative.filter(
                set => set.id !== action.payload.setId,
            );
        },
        toggleCollapsed(state, action: PayloadAction<{ setId: string }>) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            writeSet(state, { ...set, collapsed: !set.collapsed });
        },
        selectRow(state, action: PayloadAction<string | null>) {
            state.selectedRowKey = action.payload;
        },
        editRowCommercial(
            state,
            action: PayloadAction<{
                setId: string;
                key: string;
                edit: CommercialEdit;
            }>,
        ) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            const row = set.rows.find(
                item => item.key === action.payload.key,
            );
            if (!row) return;
            writeSet(
                state,
                upsertRow(set, {
                    ...row,
                    price: applyCommercialEdit(row.price, action.payload.edit),
                }),
            );
        },
        setRowComposition(
            state,
            action: PayloadAction<{
                setId: string;
                key: string;
                composition: Composition;
            }>,
        ) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            const row = set.rows.find(item => item.key === action.payload.key);
            if (!row) return;
            writeSet(state, {
                ...set,
                rows: set.rows.map(item =>
                    item.key === action.payload.key
                        ? { ...item, composition: action.payload.composition }
                        : item,
                ),
            });
        },
        setContext(state, action: PayloadAction<Partial<RowSetContext>>) {
            state.context = { ...state.context, ...action.payload };
        },
        /** Прямая запись пересобранного сета (listener sync-set) */
        writeSyncedSet(state, action: PayloadAction<RowSet>) {
            if (state.general.id === action.payload.id) {
                state.general = action.payload;
                return;
            }
            state.alternative = state.alternative.map(set =>
                set.id === action.payload.id ? action.payload : set,
            );
        },
        /** Восстановление из слепка */
        restore(
            state,
            action: PayloadAction<{ general: RowSet; alternative: RowSet[] }>,
        ) {
            state.general = action.payload.general;
            state.alternative = action.payload.alternative;
            state.selectedRowKey = null;
        },
        reset() {
            return initialState;
        },
    },
});

// Деструктуризация вместо экспорта slice.actions целиком —
// обход TS2742 (immer-тип не именуется при pnpm-раскладке)
const {
    upsertRow: upsertRowAction,
    replaceServiceRow: replaceServiceRowAction,
    removeRow: removeRowAction,
    addComparisonSet,
    removeComparisonSet,
    toggleCollapsed,
    selectRow,
    editRowCommercial,
    setRowComposition,
    setContext,
    writeSyncedSet,
    restore,
    reset,
} = rowSetSlice.actions;

export const rowSetActions = {
    upsertRow: upsertRowAction,
    replaceServiceRow: replaceServiceRowAction,
    removeRow: removeRowAction,
    addComparisonSet,
    removeComparisonSet,
    toggleCollapsed,
    selectRow,
    editRowCommercial,
    setRowComposition,
    setContext,
    writeSyncedSet,
    restore,
    reset,
};
export const rowSetReducer = rowSetSlice.reducer;

/** Селекторы */
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
