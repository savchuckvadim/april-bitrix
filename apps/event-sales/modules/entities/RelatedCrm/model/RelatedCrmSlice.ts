import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { SectionStatus } from '@/modules/shared/SectionState';
import type { RelatedCrmDetails } from './index';

/**
 * Связи клиента (duplicates/details) — общий стор вместо локального useState.
 *
 * Данные читает шапка-layout на всех экранах: живи они в компоненте, каждый
 * переход список ↔ дело начинался бы с `details = null`, полоска воронки
 * пропадала и уходил новый запрос (на списке — три дубля одного). Здесь ответ
 * загружается один раз листенером и переживает переключения экранов.
 */
export interface RelatedCrmState {
    details: RelatedCrmDetails | null;
    status: SectionStatus;
    /** Показывать закрытые сделки и отработанные лиды (тумблер на экране клиента). */
    includeClosed: boolean;
    /** Ключ активного запроса (entityType:entityId:open|all) — дедуп и latest-wins. */
    key: string | null;
}

const initialState: RelatedCrmState = {
    details: null,
    status: 'idle',
    includeClosed: false,
    key: null,
};

const relatedCrmSlice = createSlice({
    name: 'relatedCrm',
    initialState,
    reducers: {
        fetchStarted(
            state,
            action: PayloadAction<{ key: string; includeClosed: boolean }>,
        ) {
            state.status = 'loading';
            state.key = action.payload.key;
            state.includeClosed = action.payload.includeClosed;
        },
        fetchSucceeded(
            state,
            action: PayloadAction<{ key: string; details: RelatedCrmDetails }>,
        ) {
            // Latest-wins: тумблер «с закрытыми» щёлкают быстрее, чем отвечает
            // портал — ответ уже неактуального ключа молча отбрасывается.
            if (state.key !== action.payload.key) return;
            state.details = action.payload.details;
            state.status = 'ready';
        },
        fetchFailed(state, action: PayloadAction<{ key: string }>) {
            if (state.key !== action.payload.key) return;
            state.status = 'error';
        },
        /** Полный сброс: reloadApp перезапрашивает всё заново. */
        reset() {
            return initialState;
        },
    },
});

/*
 * Экспорты аннотированы явно: инференс через generated-тип RelatedCrmDetails
 * тащил бы в объявление immer-тип из pnpm-пути (TS2742), которого нет в
 * зависимостях (та же грабля, что у TaskDealsSlice).
 */
export const relatedCrmActions: {
    fetchStarted: ActionCreatorWithPayload<
        { key: string; includeClosed: boolean },
        'relatedCrm/fetchStarted'
    >;
    fetchSucceeded: ActionCreatorWithPayload<
        { key: string; details: RelatedCrmDetails },
        'relatedCrm/fetchSucceeded'
    >;
    fetchFailed: ActionCreatorWithPayload<
        { key: string },
        'relatedCrm/fetchFailed'
    >;
    reset: ActionCreatorWithoutPayload<'relatedCrm/reset'>;
} = relatedCrmSlice.actions;

export const relatedCrmReducer: Reducer<RelatedCrmState> =
    relatedCrmSlice.reducer;
