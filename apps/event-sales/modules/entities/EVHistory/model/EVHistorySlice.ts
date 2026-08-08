import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { SectionStatus } from '@/modules/shared/SectionState';
import {
    EVHistoryGroupState,
    EVHistoryRecord,
    HistoryBinding,
} from './history-record.type';

export interface EVHistoryState {
    status: SectionStatus;
    /** Списка нет на портале — история недоступна, и это не ошибка. */
    isListMissing: boolean;
    /**
     * Записи по id — дедуп между лентами: запись с несколькими привязками
     * приходит в нескольких группах, но хранится один раз.
     */
    records: Record<number, EVHistoryRecord>;
    /** Ленты по привязкам в порядке приоритета (компания → сделки → ...). */
    groups: EVHistoryGroupState[];
}

const initialState: EVHistoryState = {
    status: 'idle',
    isListMissing: false,
    records: {},
    groups: [],
};

interface GroupPagePayload {
    binding: string;
    records: EVHistoryRecord[];
    next: number | null;
    total: number | null;
}

const absorbRecords = (
    state: EVHistoryState,
    records: EVHistoryRecord[],
): void => {
    for (const record of records) {
        if (!record.id) continue;
        const existing = state.records[record.id];
        state.records[record.id] = existing
            ? {
                  ...record,
                  bindings: [
                      ...new Set([...existing.bindings, ...record.bindings]),
                  ],
              }
            : record;
    }
};

const eventHistorySlice = createSlice({
    name: 'eventHistory',
    initialState,
    reducers: {
        setLoading: (state: EVHistoryState) => {
            state.status = 'loading';
        },
        /** Стартовая загрузка: все ленты первыми страницами. */
        setInitial: (
            state: EVHistoryState,
            action: PayloadAction<{
                groups: {
                    binding: HistoryBinding;
                    records: EVHistoryRecord[];
                    next: number | null;
                    total: number | null;
                }[];
            }>,
        ) => {
            state.records = {};
            state.groups = action.payload.groups.map(group => {
                return {
                    binding: group.binding,
                    ids: group.records.map(record => record.id),
                    next: group.next,
                    total: group.total,
                    isLoadingMore: false,
                };
            });
            for (const group of action.payload.groups) {
                absorbRecords(state, group.records);
            }
            state.status = 'ready';
            state.isListMissing = false;
        },
        setGroupLoadingMore: (
            state: EVHistoryState,
            action: PayloadAction<{ binding: string; status: boolean }>,
        ) => {
            const group = state.groups.find(
                item => item.binding.value === action.payload.binding,
            );
            if (group) group.isLoadingMore = action.payload.status;
        },
        /** Догруженная страница одной ленты. */
        setGroupPage: (
            state: EVHistoryState,
            action: PayloadAction<GroupPagePayload>,
        ) => {
            const { binding, records, next, total } = action.payload;
            const group = state.groups.find(
                item => item.binding.value === binding,
            );
            if (!group) return;
            const known = new Set(group.ids);
            for (const record of records) {
                if (!known.has(record.id)) group.ids.push(record.id);
            }
            group.next = next;
            group.total = total ?? group.total;
            group.isLoadingMore = false;
            absorbRecords(state, records);
        },
        setError: (state: EVHistoryState) => {
            state.status = 'error';
        },
        setListMissing: (state: EVHistoryState) => {
            state.status = 'ready';
            state.isListMissing = true;
            state.records = {};
            state.groups = [];
        },
        reset: () => initialState,
    },
});

export const eventHistoryReducer = eventHistorySlice.reducer;
export const eventHistoryActions = eventHistorySlice.actions;
