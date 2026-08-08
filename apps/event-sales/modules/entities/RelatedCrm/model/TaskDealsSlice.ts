import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { StageDictItem } from '../lib/bound-deal-view';
import type { RelatedDeal } from './index';

/**
 * Сделки, привязанные к задачам обзвона (`UF_CRM_TASK: D_<id>`).
 *
 * Отдельный источник рядом с графом связей клиента (duplicates/details):
 * привязка задачи — первоисточник «сделки этого дела» (по ней же считается
 * отчёт), а в графе клиента старых сделок, созданных без связей, может не
 * быть вовсе. Наполняется листенером на setFetchedTasks.
 */
export interface TaskDealsState {
    /** Загруженные открытые привязанные сделки. */
    byId: Record<number, RelatedDeal>;
    /** id, по которым запрос уже уходил — повторно не спрашиваем. */
    requestedIds: number[];
    /**
     * Словари стадий воронок (ENTITY_ID → стадии в порядке SORT): позиция
     * привязанной сделки и посегментные тултипы полосок. Воронки за сессию
     * фрейма не меняются — словарь грузится один раз.
     */
    stageDicts: Record<string, StageDictItem[]>;
}

const initialState: TaskDealsState = {
    byId: {},
    requestedIds: [],
    stageDicts: {},
};

const taskDealsSlice = createSlice({
    name: 'taskDeals',
    initialState,
    reducers: {
        markRequested(state, action: PayloadAction<{ ids: number[] }>) {
            state.requestedIds.push(...action.payload.ids);
        },
        setDeals(state, action: PayloadAction<{ deals: RelatedDeal[] }>) {
            for (const deal of action.payload.deals) {
                state.byId[deal.id] = deal;
            }
        },
        /** Полный сброс: reloadApp перезапрашивает всё заново. */
        reset() {
            return initialState;
        },
        setStageDict(
            state,
            action: PayloadAction<{ entityId: string; dict: StageDictItem[] }>,
        ) {
            state.stageDicts[action.payload.entityId] = action.payload.dict;
        },
    },
});

/*
 * Экспорты аннотированы явно: инференс через generated-тип RelatedDeal тащил
 * в объявление immer-тип из pnpm-пути (TS2742), которого нет в зависимостях.
 */
export const taskDealsActions: {
    markRequested: ActionCreatorWithPayload<
        { ids: number[] },
        'taskDeals/markRequested'
    >;
    setDeals: ActionCreatorWithPayload<
        { deals: RelatedDeal[] },
        'taskDeals/setDeals'
    >;
    reset: ActionCreatorWithoutPayload<'taskDeals/reset'>;
    setStageDict: ActionCreatorWithPayload<
        { entityId: string; dict: StageDictItem[] },
        'taskDeals/setStageDict'
    >;
} = taskDealsSlice.actions;

export const taskDealsReducer: Reducer<TaskDealsState> = taskDealsSlice.reducer;
