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
    /** Слепки и настройки из нашей базы — по ним вход решает, показывать ли варианты */
    status: ComplectVariantStatus;
    /**
     * Элементы смарта из Битрикса (названия и стадии) — приходят позже и вход
     * не держат. Пока грузятся, стадии неизвестны: документы и правки ждут.
     */
    itemsStatus: ComplectVariantStatus;
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
    itemsStatus: 'idle',
    isBusy: false,
    error: null,
};

const complectVariantSlice = createSlice({
    name: 'complectVariant',
    initialState,
    reducers: {
        loading(state) {
            state.status = 'loading';
            state.itemsStatus = 'loading';
            state.error = null;
        },
        /** Слепки и настройки пришли; запись закончена, когда пришли и элементы */
        loaded(
            state,
            action: PayloadAction<{
                records: ComplectVariantRecordDto[];
                composition: ComplectComposition | null;
            }>,
        ) {
            // элементы Битрикса уже отказали — варианты не показываем, как при любом сбое
            if (state.status === 'error') return;
            state.records = action.payload.records;
            state.composition = action.payload.composition;
            state.status = 'ready';
            if (state.itemsStatus !== 'loading') state.isBusy = false;
        },
        itemsLoaded(state, action: PayloadAction<ComplectVariantItem[]>) {
            state.items = action.payload;
            state.itemsStatus = 'ready';
            if (state.status !== 'loading') state.isBusy = false;
        },
        /**
         * Сбой любой из загрузок: стадий нет — кто участвует в сделке, неизвестно,
         * поэтому варианты не показываем вовсе, конструктор работает как без них.
         */
        failed(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.itemsStatus = 'error';
            state.records = [];
            state.isBusy = false;
            state.error = action.payload;
        },
        busy(state, action: PayloadAction<boolean>) {
            state.isBusy = action.payload;
        },
        /**
         * Свежая запись, которую сервер вернул на сохранение варианта: заменяет
         * старую по variantSmartId, новую добавляет в конец. Без этого список
         * хранит слепки на момент последнего чтения, и повторное открытие
         * варианта поднимает устаревшие данные.
         */
        upsertRecord(state, action: PayloadAction<ComplectVariantRecordDto>) {
            // после сбоя варианты скрыты (records пуст): добавлять в пустой список
            // одну запись значило бы показать неполный набор
            if (state.status === 'error') return;
            const { variantSmartId } = action.payload;
            // запись без variantSmartId — слепок самой сделки, в списке вариантов ей нет места
            if (variantSmartId === null) return;
            const index = state.records.findIndex(
                record => record.variantSmartId === variantSmartId,
            );
            if (index === -1) {
                state.records.push(action.payload);
            } else {
                state.records[index] = action.payload;
            }
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
    itemsLoaded,
    failed,
    busy,
    upsertRecord,
    setOpenVariant,
    setComposition,
    reset,
} = complectVariantSlice.actions;

export const complectVariantActions = {
    loading,
    loaded,
    itemsLoaded,
    failed,
    busy,
    upsertRecord,
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

/**
 * Варианты есть, а их стадии из Битрикса ещё в пути: кто участвует в сделке,
 * пока неизвестно — документы по вариантам в этот момент собирать нельзя.
 */
export const selectVariantStagesLoading = (state: WithComplectVariant): boolean =>
    state.complectVariant.records.length > 0 &&
    state.complectVariant.itemsStatus === 'loading';

/** Стадия варианта по элементу смарта; элемента нет — черновик. */
export const selectVariantStageOf =
    (state: WithComplectVariant) => (variantSmartId: number | null) => {
        const item = state.complectVariant.items.find(
            candidate => candidate.id === Number(variantSmartId),
        );
        return item ? resolveVariantStage(item.stageId) : COMPLECT_VARIANT_STAGE.draft;
    };
