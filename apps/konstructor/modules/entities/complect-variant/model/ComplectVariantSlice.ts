import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ComplectVariantItem } from '../lib/api/complect-variant-helper';
import { isSameOfferComposition, toOfferComposition } from '../lib/offer-composition';
import { selectOfferParticipants, selectParticipants } from '../lib/participants';
import {
    COMPLECT_VARIANT_STAGE,
    resolveVariantStage,
    type ComplectVariantStage,
} from '../lib/stage';
import {
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectComposition,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from './dto';

export type ComplectVariantStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ComplectVariantState {
    /** Слепки вариантов сделки, в порядке создания. */
    records: ComplectVariantRecordDto[];
    /** Элементы смарта в Битриксе: заголовок и стадия (закрытая стадия выводит вариант из документов). */
    items: ComplectVariantItem[];
    /**
     * Активный указатель: вариант, которым прямо сейчас является живое
     * состояние конструктора. Ставится только действиями этой сессии: вариант
     * открыли, создали или сохранили. Его читают запись варианта, документы,
     * запрет удаления и бейдж «Сейчас редактируется».
     */
    openVariantSmartId: number | null;
    /**
     * Подсказка из настроек сделки: какой вариант открывали в прошлый раз.
     * Живое состояние после входа поднято из слепка сделки и этому варианту
     * равно не обязано, поэтому подсказка ничего не пишет и ничего не решает:
     * по ней экран выбора помечает плитку.
     */
    lastOpenVariantSmartId: number | null;
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
    /**
     * Текст последней ошибки. Его ставят сбой загрузки (`failed`, список
     * скрыт) и сбой действия (`actionFailed`, список остаётся на экране).
     */
    error: string | null;
}

/** Вариант с таким variantSmartId есть в списке. */
const hasVariant = (
    records: ComplectVariantRecordDto[],
    variantSmartId: number | null,
): variantSmartId is number =>
    variantSmartId !== null &&
    records.some(record => record.variantSmartId === variantSmartId);

const initialState: ComplectVariantState = {
    records: [],
    items: [],
    openVariantSmartId: null,
    lastOpenVariantSmartId: null,
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
        /**
         * Слепки и настройки пришли; запись закончена, когда пришли и элементы.
         * Заодно сводятся указатели. Подсказка берётся из настроек сделки, если
         * такой вариант есть в списке. Активный указатель остаётся прежним, пока
         * его запись в списке, иначе сбрасывается; на первом входе он пуст.
         */
        loaded(
            state,
            action: PayloadAction<{
                records: ComplectVariantRecordDto[];
                composition: ComplectComposition | null;
            }>,
        ) {
            // элементы Битрикса уже отказали — варианты не показываем, как при любом сбое
            if (state.status === 'error') return;
            const { records, composition } = action.payload;
            state.records = records;
            state.composition = composition;
            const hint = composition?.openVariantSmartId ?? null;
            state.lastOpenVariantSmartId = hasVariant(records, hint) ? hint : null;
            if (!hasVariant(records, state.openVariantSmartId)) {
                state.openVariantSmartId = null;
            }
            state.error = null;
            state.status = 'ready';
            if (state.itemsStatus !== 'loading') state.isBusy = false;
        },
        itemsLoaded(state, action: PayloadAction<ComplectVariantItem[]>) {
            state.items = action.payload;
            state.itemsStatus = 'ready';
            if (state.status !== 'loading') state.isBusy = false;
        },
        /**
         * Сбой любой из загрузок списка: стадий нет — кто участвует в сделке,
         * неизвестно, поэтому варианты не показываем вовсе, конструктор работает
         * как без них. Сбой действия над вариантами сюда не пишется: для него
         * есть `actionFailed`.
         */
        failed(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.itemsStatus = 'error';
            state.records = [];
            state.isBusy = false;
            state.error = action.payload;
        },
        /**
         * Сбой действия с вариантами (открытие, закрытие, создание, стадия,
         * настройки, запись открытого варианта): меняется только текст ошибки.
         * Список и статус остаются как были, иначе отказ сети убрал бы с экрана
         * варианты, с которыми работает менеджер.
         */
        actionFailed(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        /** Начинается новое действие с вариантами: прежний текст ошибки снимается. */
        clearError(state) {
            state.error = null;
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
    actionFailed,
    clearError,
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
    actionFailed,
    clearError,
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

/**
 * Идёт запись или загрузка вариантов. Пока стадии из Битрикса в пути, править
 * варианты и режим рано: стадия на экране ещё не настоящая. Кнопки и выбор
 * режима заблокированы.
 */
export const selectVariantsBusy = (state: WithComplectVariant): boolean =>
    state.complectVariant.isBusy ||
    state.complectVariant.status === 'loading' ||
    state.complectVariant.itemsStatus === 'loading';

/**
 * Стадия варианта по элементу смарта; элемента нет — черновик. Функция
 * пересоздаётся только при смене элементов, поэтому подписчикам и зависимым
 * селекторам её можно отдавать как есть.
 */
export const selectVariantStageOf = createSelector(
    [(state: WithComplectVariant) => state.complectVariant.items],
    items =>
        (variantSmartId: number | null): ComplectVariantStage => {
            const item = items.find(
                candidate => candidate.id === Number(variantSmartId),
            );
            return item
                ? resolveVariantStage(item.stageId)
                : COMPLECT_VARIANT_STAGE.draft;
        },
);

/** Режим сделки: кто из вариантов идёт в договор и отчёт о поставке (со значением по умолчанию). */
export const selectComplectMode = (state: WithComplectVariant): ComplectMode =>
    selectComposition(state).mode;

/**
 * Настройки сделки для КП: режим всегда `compare`, остальное как в сделке.
 * Смена режима даёт тот же объект, поэтому запрос КП и ключ превью от неё не
 * пересобираются.
 */
export const selectOfferComposition = createSelector(
    [selectComposition],
    (composition): ComplectComposition => toOfferComposition(composition),
    { memoizeOptions: { resultEqualityCheck: isSameOfferComposition } },
);

/**
 * Участники КП (Word, PDF, оба превью). КП делают по одному варианту: участник
 * открытый незакрытый вариант при любом режиме сделки, режим в селектор не
 * входит (см. selectOfferParticipants).
 */
export const selectOfferVariantParticipants = createSelector(
    [
        (state: WithComplectVariant) => state.complectVariant.records,
        selectVariantStageOf,
        (state: WithComplectVariant) => state.complectVariant.openVariantSmartId,
    ],
    (records, stageOf, openVariantSmartId): ComplectVariantRecordDto[] =>
        selectOfferParticipants(records, stageOf, openVariantSmartId),
);

/**
 * Участники документов, которые идут по режиму сделки: договор, отчёт о
 * поставке, заявка поставки и товары сделки. Пересчитывается при смене
 * записей, стадий элементов, режима и открытого варианта (см. selectParticipants).
 */
export const selectModeVariantParticipants = createSelector(
    [
        (state: WithComplectVariant) => state.complectVariant.records,
        selectVariantStageOf,
        selectComplectMode,
        (state: WithComplectVariant) => state.complectVariant.openVariantSmartId,
    ],
    (records, stageOf, mode, openVariantSmartId): ComplectVariantRecordDto[] =>
        selectParticipants(records, stageOf, mode, openVariantSmartId),
);
