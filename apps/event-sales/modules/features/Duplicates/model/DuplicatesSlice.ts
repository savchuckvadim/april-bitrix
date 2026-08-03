import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
    DuplicateCandidate,
    DuplicateDetails,
    DuplicateSearchResponse,
    DuplicateSignals,
    DuplicatesStatus,
} from './index';

const initialState = {
    /** Состояние последнего поиска. */
    status: 'idle' as DuplicatesStatus,
    error: null as string | null,
    candidates: [] as DuplicateCandidate[],
    signals: null as DuplicateSignals | null,
    /** ISO-время последнего успешного поиска — показываем в шапке ленты. */
    searchedAt: null as string | null,
    /** Ответ пришёл из кэша бэкенда — портал не опрашивался. */
    fromCache: false,
    /** Цена поиска в обращениях к порталу — видно в подсказке. */
    batchRequests: 0,
    warnings: [] as string[],
    /**
     * Поиск был автоматическим (по открытию приложения). Влияет на показ
     * ошибки: автопоиск падает молча, чтобы не мешать заполнять отчёт.
     */
    isAuto: false,

    /** Открытая карточка деталей: ключ кандидата + данные. */
    selectedKey: null as string | null,
    detailsStatus: 'idle' as DuplicatesStatus,
    detailsError: null as string | null,
    details: null as DuplicateDetails | null,

    /** Открыта ли форма ручного поиска. */
    isManualOpen: false,
};

export type DuplicatesState = typeof initialState;

const duplicatesSlice = createSlice({
    name: 'duplicates',
    initialState,
    reducers: {
        searchStarted: (
            state: DuplicatesState,
            action: PayloadAction<{ isAuto: boolean }>,
        ) => {
            state.status = 'loading';
            state.error = null;
            state.isAuto = action.payload.isAuto;
        },
        searchSucceeded: (
            state: DuplicatesState,
            action: PayloadAction<{ result: DuplicateSearchResponse }>,
        ) => {
            const { result } = action.payload;
            state.status = 'ready';
            state.error = null;
            state.candidates = result.candidates;
            state.signals = result.signals;
            state.fromCache = result.fromCache;
            state.batchRequests = result.batchRequests;
            state.warnings = result.warnings;
            state.searchedAt = new Date().toISOString();
        },
        searchFailed: (
            state: DuplicatesState,
            action: PayloadAction<{ message: string }>,
        ) => {
            state.status = 'error';
            state.error = action.payload.message;
        },

        detailsOpened: (
            state: DuplicatesState,
            action: PayloadAction<{ key: string }>,
        ) => {
            state.selectedKey = action.payload.key;
            state.detailsStatus = 'loading';
            state.detailsError = null;
            state.details = null;
        },
        detailsSucceeded: (
            state: DuplicatesState,
            action: PayloadAction<{ details: DuplicateDetails }>,
        ) => {
            state.detailsStatus = 'ready';
            state.details = action.payload.details;
        },
        detailsFailed: (
            state: DuplicatesState,
            action: PayloadAction<{ message: string }>,
        ) => {
            state.detailsStatus = 'error';
            state.detailsError = action.payload.message;
        },
        detailsClosed: (state: DuplicatesState) => {
            state.selectedKey = null;
            state.detailsStatus = 'idle';
            state.detailsError = null;
            state.details = null;
        },

        manualToggled: (
            state: DuplicatesState,
            action: PayloadAction<{ isOpen: boolean }>,
        ) => {
            state.isManualOpen = action.payload.isOpen;
        },
    },
});

export const duplicatesReducer = duplicatesSlice.reducer;
export const duplicatesActions = duplicatesSlice.actions;
