import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { ChecklistId } from '../type/call-checklist.type';

export type ChecklistBaseDealStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Состояние чек-листов.
 *
 * `valueByCode` — значения ПОВЕРХ строк сущностей (строки перечитываются
 * только на reload — как PurchaseSignals). Для crm-полей значение попадает
 * сюда ПОСЛЕ успешной записи в CRM (пессимистичный персист) — это факт, не
 * черновик. Для dto-полей (продажа) — значение просто копится и уезжает в
 * payload отправки.
 *
 * Модальная часть — паттерн AfterPresentation: `pendingSend` + `confirmed`
 * дают идемпотентный re-entry send(): подтверждённый чек-лист при повторном
 * проходе пропускается, следующий неподтверждённый открывается сам.
 *
 * `baseDeal` — строка базовой сделки, лениво догруженная по predict.baseDealId,
 * когда во встройке-компании сделки в сторе нет (текущие значения полей).
 */
export interface CallChecklistState {
    valueByCode: Record<string, string>;
    /**
     * Набранное менеджером, ещё не уехавшее в CRM. Контрол показывает
     * черновик: без него запись «через 600 мс» откатывала бы поле к прежнему
     * значению на первом же ререндере стора (React возвращает `value` в DOM).
     */
    draftByCode: Record<string, string>;
    /** Коды полей, по которым запись прямо сейчас идёт в портал. */
    savingCodes: Record<string, boolean>;
    error: string | null;
    activeModalId: ChecklistId | null;
    confirmed: Partial<Record<ChecklistId, boolean>>;
    pendingSend: boolean;
    baseDeal: {
        id: number | null;
        row: Record<string, unknown> | null;
        status: ChecklistBaseDealStatus;
    };
}

const initialState: CallChecklistState = {
    valueByCode: {},
    draftByCode: {},
    savingCodes: {},
    error: null,
    activeModalId: null,
    confirmed: {},
    pendingSend: false,
    baseDeal: { id: null, row: null, status: 'idle' },
};

const callChecklistSlice = createSlice({
    name: 'callChecklist',
    initialState,
    reducers: {
        /** Менеджер набирает — показываем ровно это, в CRM пока не пишем. */
        setDraft(
            state,
            action: PayloadAction<{ code: string; value: string }>,
        ) {
            state.draftByCode[action.payload.code] = action.payload.value;
        },
        /** Запись поля ушла в портал. */
        saveStarted(state, action: PayloadAction<{ code: string }>) {
            state.savingCodes[action.payload.code] = true;
            state.error = null;
        },
        /** Портал принял значение — оно становится фактом, черновик не нужен. */
        saveSucceeded(
            state,
            action: PayloadAction<{ code: string; value: string }>,
        ) {
            state.valueByCode[action.payload.code] = action.payload.value;
            delete state.draftByCode[action.payload.code];
            delete state.savingCodes[action.payload.code];
        },
        /**
         * Портал не принял: черновик ОСТАЁТСЯ на экране (менеджер видит, что
         * пытался записать), значение-факт не подменяется.
         */
        saveFailed(
            state,
            action: PayloadAction<{ code: string; message: string }>,
        ) {
            delete state.savingCodes[action.payload.code];
            state.error = action.payload.message;
        },
        setError(state, action: PayloadAction<{ message: string | null }>) {
            state.error = action.payload.message;
        },
        modalOpened(state, action: PayloadAction<{ id: ChecklistId }>) {
            state.activeModalId = action.payload.id;
        },
        modalClosed(state) {
            state.activeModalId = null;
        },
        setPendingSend(state, action: PayloadAction<{ status: boolean }>) {
            state.pendingSend = action.payload.status;
        },
        setConfirmed(state, action: PayloadAction<{ id: ChecklistId }>) {
            state.confirmed[action.payload.id] = true;
        },
        baseDealPending(state, action: PayloadAction<{ id: number }>) {
            state.baseDeal = {
                id: action.payload.id,
                row: null,
                status: 'loading',
            };
        },
        baseDealLoaded(
            state,
            action: PayloadAction<{
                id: number;
                row: Record<string, unknown>;
            }>,
        ) {
            if (state.baseDeal.id !== action.payload.id) return;
            state.baseDeal.row = action.payload.row;
            state.baseDeal.status = 'ready';
        },
        baseDealFailed(state, action: PayloadAction<{ id: number }>) {
            if (state.baseDeal.id !== action.payload.id) return;
            // Без строки чек-лист показывает поля без «текущих значений» —
            // не блокируем (см. resolveChecklistField, graceful).
            state.baseDeal.status = 'error';
        },
        /** Полный сброс: reloadApp перечитает значения из сущностей. */
        reset: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const callChecklistActions: {
    setDraft: ActionCreatorWithPayload<
        { code: string; value: string },
        'callChecklist/setDraft'
    >;
    saveStarted: ActionCreatorWithPayload<
        { code: string },
        'callChecklist/saveStarted'
    >;
    saveSucceeded: ActionCreatorWithPayload<
        { code: string; value: string },
        'callChecklist/saveSucceeded'
    >;
    saveFailed: ActionCreatorWithPayload<
        { code: string; message: string },
        'callChecklist/saveFailed'
    >;
    setError: ActionCreatorWithPayload<
        { message: string | null },
        'callChecklist/setError'
    >;
    modalOpened: ActionCreatorWithPayload<
        { id: ChecklistId },
        'callChecklist/modalOpened'
    >;
    modalClosed: ActionCreatorWithoutPayload<'callChecklist/modalClosed'>;
    setPendingSend: ActionCreatorWithPayload<
        { status: boolean },
        'callChecklist/setPendingSend'
    >;
    setConfirmed: ActionCreatorWithPayload<
        { id: ChecklistId },
        'callChecklist/setConfirmed'
    >;
    baseDealPending: ActionCreatorWithPayload<
        { id: number },
        'callChecklist/baseDealPending'
    >;
    baseDealLoaded: ActionCreatorWithPayload<
        { id: number; row: Record<string, unknown> },
        'callChecklist/baseDealLoaded'
    >;
    baseDealFailed: ActionCreatorWithPayload<
        { id: number },
        'callChecklist/baseDealFailed'
    >;
    reset: ActionCreatorWithoutPayload<'callChecklist/reset'>;
} = callChecklistSlice.actions;

export const callChecklistReducer: Reducer<CallChecklistState> =
    callChecklistSlice.reducer;
