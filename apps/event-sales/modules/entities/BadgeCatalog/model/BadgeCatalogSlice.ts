import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { BadgeCatalogMode, BadgeItem } from './badge-catalog.type';

export type BadgeCatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Каталог бейджиков портала.
 *
 * В Redux, а не в react-query: читают его синхронные селекторы (чипы под
 * комментарием, автоподстановка названия в листенере).
 *
 * Встроенного набора во фрейме НЕТ намеренно: общий набор живёт на бэке и
 * приезжает оттуда и в режиме «по умолчанию». Бэк молчит — бейджиков нет, и
 * это не ошибка: отчёт отправляется как раньше, менеджер пишет сам.
 *
 * Каталог не сбрасывается на ⟳ (как и каталог анкет): состав портала
 * перезагрузкой карточки не меняется, перечитывание — по смене домена и
 * расхождению хэша (ensureBadgeCatalog).
 */
export interface BadgeCatalogState {
    status: BadgeCatalogStatus;
    /** Портал, чей набор в руках — чтобы ⟳ не перечитывал состав. */
    domain: string;
    contract: number;
    version: number;
    /** sha1 состава — единственный компаратор «менялся ли набор». */
    hash: string | null;
    mode: BadgeCatalogMode;
    items: BadgeItem[];
}

const initialState: BadgeCatalogState = {
    status: 'idle',
    domain: '',
    contract: 0,
    version: 0,
    hash: null,
    mode: 'default',
    items: [],
};

const badgeCatalogSlice = createSlice({
    name: 'badgeCatalog',
    initialState,
    reducers: {
        pending(state, action: PayloadAction<{ domain: string }>) {
            state.status = 'loading';
            state.domain = action.payload.domain;
        },
        fulfilled(
            state,
            action: PayloadAction<{
                contract: number;
                version: number;
                hash: string;
                mode: BadgeCatalogMode;
                items: BadgeItem[];
            }>,
        ) {
            state.status = 'ready';
            state.contract = action.payload.contract;
            state.version = action.payload.version;
            state.hash = action.payload.hash;
            state.mode = action.payload.mode;
            state.items = action.payload.items;
        },
        /** Каталог недоступен — бейджиков нет; хэш гасим, чтобы перечитать после сбоя. */
        failed(state) {
            state.status = 'error';
            state.items = [];
            state.hash = null;
        },
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const badgeCatalogActions: {
    pending: ActionCreatorWithPayload<{ domain: string }, 'badgeCatalog/pending'>;
    fulfilled: ActionCreatorWithPayload<
        {
            contract: number;
            version: number;
            hash: string;
            mode: BadgeCatalogMode;
            items: BadgeItem[];
        },
        'badgeCatalog/fulfilled'
    >;
    failed: ActionCreatorWithoutPayload<'badgeCatalog/failed'>;
} = badgeCatalogSlice.actions;

export const badgeCatalogReducer: Reducer<BadgeCatalogState> = badgeCatalogSlice.reducer;
