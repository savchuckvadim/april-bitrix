import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import type { KRow, RowSet } from './types';
import {
    applySetQuantity,
    buildTotalRow,
    canAddComparisonSet,
    createSet,
    removeRowCascade,
    replaceServiceRow,
    upsertRow,
    type RowSetContext,
} from '../lib/set';
import { applyCommercialEdit, type CommercialEdit } from '../lib/price';
import type { Composition } from '../../composition';

export interface RowSetState {
    general: RowSet;
    alternative: RowSet[];
    /** Строка, чьё наполнение открыто в редакторе состава */
    selectedRowKey: string | null;
    /** Сет в режиме редактирования строк при свёрнутом виде (легаси «карандаш») */
    editingSetId: string | null;
    /** Контекст ценообразования: регион и налог поставщика */
    context: RowSetContext;
}

const initialState: RowSetState = {
    general: createSet('general', 'general'),
    alternative: [],
    selectedRowKey: null,
    editingSetId: null,
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
            const row = set.rows.find(
                item => item.key === action.payload.key,
            );
            // Главный товар general-сета не удаляется (легаси-гард)
            if (!row || row.role === 'main') return;
            const next = removeRowCascade(set, action.payload.key);
            if (next === null) {
                // Последний garant удалён — сет умирает
                if (set.kind === 'alternative') {
                    state.alternative = state.alternative.filter(
                        item => item.id !== set.id,
                    );
                } else {
                    state.general = createSet(set.id, 'general');
                }
                if (state.editingSetId === set.id) state.editingSetId = null;
            } else {
                writeSet(state, next);
            }
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
            if (state.editingSetId === action.payload.setId) {
                state.editingSetId = null;
            }
        },
        toggleCollapsed(state, action: PayloadAction<{ setId: string }>) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            // Сворачивать есть смысл только сет из ≥2 строк (легаси-правило)
            if (!set.collapsed && set.rows.length <= 1) return;
            const next: RowSet = { ...set, collapsed: !set.collapsed };
            // Разворот сбрасывает ручную правку total-строки
            writeSet(state, next.collapsed ? next : { ...next, totalPrice: null });
            if (!next.collapsed && state.editingSetId === set.id) {
                state.editingSetId = null;
            }
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
            // Количество едино по сету (легаси-пропагация), прочее — построчно
            if (action.payload.edit.kind === 'quantity') {
                writeSet(
                    state,
                    applySetQuantity(set, action.payload.edit.value),
                );
                return;
            }
            writeSet(
                state,
                upsertRow(set, {
                    ...row,
                    price: applyCommercialEdit(row.price, action.payload.edit),
                }),
            );
        },
        /** Правка коммерции свёрнутой total-строки (легаси SET-режим) */
        editTotalCommercial(
            state,
            action: PayloadAction<{ setId: string; edit: CommercialEdit }>,
        ) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            if (action.payload.edit.kind === 'quantity') {
                writeSet(
                    state,
                    applySetQuantity(set, action.payload.edit.value),
                );
                return;
            }
            const basePrice = set.totalPrice ?? buildTotalRow(set)?.price;
            if (!basePrice) return;
            writeSet(state, {
                ...set,
                totalPrice: applyCommercialEdit(
                    basePrice,
                    action.payload.edit,
                ),
            });
        },
        /** Пользовательское имя строки (легаси alternativeName, null = вернуть дефолт) */
        renameRow(
            state,
            action: PayloadAction<{
                setId: string;
                key: string;
                alternativeName: string | null;
            }>,
        ) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            writeSet(state, {
                ...set,
                rows: set.rows.map(row =>
                    row.key === action.payload.key
                        ? {
                              ...row,
                              names: {
                                  ...row.names,
                                  alternativeName:
                                      action.payload.alternativeName?.trim() ||
                                      null,
                              },
                          }
                        : row,
                ),
            });
        },
        /** ₽/%-переключатель скидки (display-only, значения не трогает) */
        toggleDiscountMode(
            state,
            action: PayloadAction<{ setId: string; key: string }>,
        ) {
            const set = findSet(state, action.payload.setId);
            if (!set) return;
            writeSet(state, {
                ...set,
                rows: set.rows.map(row =>
                    row.key === action.payload.key
                        ? {
                              ...row,
                              price: {
                                  ...row.price,
                                  discount: {
                                      ...row.price.discount,
                                      current:
                                          row.price.discount.current ===
                                          'percent'
                                              ? 'amount'
                                              : 'percent',
                                  },
                              },
                          }
                        : row,
                ),
            });
        },
        /** Налог поставщика: только контекст; массовый пересчёт — listener */
        setWithTax(state, action: PayloadAction<boolean>) {
            state.context.withTax = action.payload;
        },
        /** Явный «пересчитать по текущим ценам» — триггер для sync-listener */
        resyncSet(_state, _action: PayloadAction<{ setId: string }>) {
            // состояние не меняется — реагирует listener
        },
        startSetEditing(state, action: PayloadAction<{ setId: string }>) {
            state.editingSetId = action.payload.setId;
        },
        stopSetEditing(state) {
            state.editingSetId = null;
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
            state.editingSetId = null;
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
    editTotalCommercial,
    renameRow,
    toggleDiscountMode,
    setWithTax,
    resyncSet,
    startSetEditing,
    stopSetEditing,
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
    editTotalCommercial,
    renameRow,
    toggleDiscountMode,
    setWithTax,
    resyncSet,
    startSetEditing,
    stopSetEditing,
    setRowComposition,
    setContext,
    writeSyncedSet,
    restore,
    reset,
};
export const rowSetReducer = rowSetSlice.reducer;

// Селекторы — model/selectors.ts (kpi-sales-паттерн)
