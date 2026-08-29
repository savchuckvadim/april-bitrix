import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import { FALLBACK_CATALOG } from '../data/fallback-catalog';
import type { QuestionnaireDef } from './questionnaire.type';

export type QuestionnaireCatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Откуда действующий состав: с портала или встроенный. */
export type QuestionnaireCatalogSource = 'server' | 'fallback';

/**
 * Портальный каталог анкет.
 *
 * Живёт в Redux, а не в react-query, потому что читают его СИНХРОННЫЕ
 * селекторы над RootState: валидация отправки и выбор следующей модалки в
 * send() не могут ждать промис.
 *
 * `defs` не бывает пустым по построению: до ответа и после любого провала
 * там стоит встроенный набор. Отправку каталог не блокирует ни в одном
 * состоянии — один 500 на бэке не имеет права положить отчёты на всех
 * порталах.
 *
 * Каталог НЕ сбрасывается при reloadApp (в отличие от ответов): состав
 * анкет портала перезагрузкой карточки не меняется, а второй запрос
 * означал бы окно, в котором вопросы исчезли с экрана.
 */
export interface QuestionnaireCatalogState {
    status: QuestionnaireCatalogStatus;
    /**
     * Портал, чей каталог сейчас в руках. Нужен, чтобы ⟳ не перечитывал
     * состав: домен перезагрузкой карточки не меняется, а весь init-цикл
     * (включая setAppData) на ⟳ проходит заново.
     */
    domain: string;
    /** Версия формы ответа, которую отдал бэк; 0 — ответа ещё не было. */
    contract: number;
    /** Счётчик правок портала (человекочитаемый, не монотонный). */
    version: number;
    /** sha1 состава — единственный надёжный компаратор «менялся ли каталог». */
    hash: string | null;
    defs: QuestionnaireDef[];
    source: QuestionnaireCatalogSource;
}

const initialState: QuestionnaireCatalogState = {
    status: 'idle',
    domain: '',
    contract: 0,
    version: 0,
    hash: null,
    defs: FALLBACK_CATALOG,
    source: 'fallback',
};

const questionnaireCatalogSlice = createSlice({
    name: 'questionnaireCatalog',
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
                defs: QuestionnaireDef[];
            }>,
        ) {
            state.status = 'ready';
            state.contract = action.payload.contract;
            state.version = action.payload.version;
            state.hash = action.payload.hash;
            state.defs = action.payload.defs;
            state.source = 'server';
        },
        /**
         * Каталог недоступен, пуст или отсеян целиком — работаем на
         * встроенном наборе. Состав возвращается к нему явно: частично
         * применённый каталог хуже отсутствующего.
         */
        failed(state) {
            state.status = 'error';
            state.defs = FALLBACK_CATALOG;
            state.source = 'fallback';
            // Хэш гасим вместе с составом: он единственный компаратор
            // «менялся ли каталог», и оставленный от прошлого удачного
            // ответа он запретил бы перечитать состав после сбоя.
            state.hash = null;
        },
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const questionnaireCatalogActions: {
    pending: ActionCreatorWithPayload<
        { domain: string },
        'questionnaireCatalog/pending'
    >;
    fulfilled: ActionCreatorWithPayload<
        {
            contract: number;
            version: number;
            hash: string;
            defs: QuestionnaireDef[];
        },
        'questionnaireCatalog/fulfilled'
    >;
    failed: ActionCreatorWithoutPayload<'questionnaireCatalog/failed'>;
} = questionnaireCatalogSlice.actions;

export const questionnaireCatalogReducer: Reducer<QuestionnaireCatalogState> =
    questionnaireCatalogSlice.reducer;
