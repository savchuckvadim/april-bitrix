import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ComplectVariantItem } from '../lib/api/complect-variant-helper';
import { COMPLECT_VARIANT_STAGE, resolveVariantStage } from '../lib/stage';
import {
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectComposition,
    type ComplectVariantRecordDto,
} from './dto';

export type ComplectVariantStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ComplectVariantState {
    /** Слепки вариантов сделки, в порядке создания. */
    records: ComplectVariantRecordDto[];
    /** Элементы смарта в Битриксе: заголовок и стадия (признак участия). */
    items: ComplectVariantItem[];
    /** Вариант, открытый в конструкторе прямо сейчас. */
    openVariantSmartId: number | null;
    /** Настройки сборки. null — сделка ведёт себя как раньше. */
    composition: ComplectComposition | null;
    status: ComplectVariantStatus;
    /** Идёт запись (создание, стадия, настройки) — кнопки заблокированы. */
    isBusy: boolean;
    error: string | null;
}

const initialState: ComplectVariantState = {
    records: [],
    items: [],
    openVariantSmartId: null,
    composition: null,
    status: 'idle',
    isBusy: false,
    error: null,
};

const complectVariantSlice = createSlice({
    name: 'complectVariant',
    initialState,
    reducers: {
        loading(state) {
            state.status = 'loading';
            state.error = null;
        },
        loaded(
            state,
            action: PayloadAction<{
                records: ComplectVariantRecordDto[];
                items: ComplectVariantItem[];
                composition: ComplectComposition | null;
            }>,
        ) {
            state.records = action.payload.records;
            state.items = action.payload.items;
            state.composition = action.payload.composition;
            state.status = 'ready';
            state.isBusy = false;
        },
        failed(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.isBusy = false;
            state.error = action.payload;
        },
        busy(state, action: PayloadAction<boolean>) {
            state.isBusy = action.payload;
        },
        setOpenVariant(state, action: PayloadAction<number | null>) {
            state.openVariantSmartId = action.payload;
        },
        setComposition(
            state,
            action: PayloadAction<ComplectComposition | null>,
        ) {
            state.composition = action.payload;
        },
        reset() {
            return initialState;
        },
    },
});

// Деструктуризация вместо экспорта slice.actions целиком — обход TS2742
const {
    loading,
    loaded,
    failed,
    busy,
    setOpenVariant,
    setComposition,
    reset,
} = complectVariantSlice.actions;

export const complectVariantActions = {
    loading,
    loaded,
    failed,
    busy,
    setOpenVariant,
    setComposition,
    reset,
};
export const complectVariantReducer = complectVariantSlice.reducer;

interface WithComplectVariant {
    complectVariant: ComplectVariantState;
}

export const selectComplectVariantState = (state: WithComplectVariant) =>
    state.complectVariant;

/** Настройки с подставленными значениями по умолчанию. */
export const selectComposition = (
    state: WithComplectVariant,
): ComplectComposition =>
    state.complectVariant.composition ?? DEFAULT_COMPLECT_COMPOSITION;

/** Стадия варианта по элементу смарта; элемента нет — черновик. */
export const selectVariantStageOf =
    (state: WithComplectVariant) => (variantSmartId: number | null) => {
        const item = state.complectVariant.items.find(
            candidate => candidate.id === Number(variantSmartId),
        );
        return item ? resolveVariantStage(item.stageId) : COMPLECT_VARIANT_STAGE.draft;
    };
