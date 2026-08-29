import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';

export type ChecklistBaseDealStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Состояние чек-листов.
 *
 * `valueByKey` — значения ПОВЕРХ строк сущностей (строки перечитываются
 * только на reload — как PurchaseSignals). Для crm-полей значение попадает
 * сюда ПОСЛЕ успешной записи в CRM (пессимистичный персист) — это факт, не
 * черновик. Для dto-полей (продажа) — значение просто копится и уезжает в
 * payload отправки.
 *
 * Ключ всех трёх карт — ОТВЕТ, а не поле: `код набора:код вопроса`
 * (`answerKey` слайса каталога анкет). Одно и то же поле осознанно
 * спрашивается в разных наборах (возражение — и в плане, и в отчёте), и по
 * коду поля они делили бы значение, статус «сохранено» и таймер записи.
 *
 * Модальная часть — паттерн AfterPresentation: `pendingSend` + `confirmed`
 * дают идемпотентный re-entry send(): подтверждённый чек-лист при повторном
 * проходе пропускается, следующий неподтверждённый открывается сам.
 *
 * `baseDeal` — строка базовой сделки, лениво догруженная по predict.baseDealId,
 * когда во встройке-компании сделки в сторе нет (текущие значения полей).
 */
export interface CallChecklistState {
    valueByKey: Record<string, string>;
    /**
     * Набранное менеджером, ещё не уехавшее в CRM. Контрол показывает
     * черновик: без него запись «через 600 мс» откатывала бы поле к прежнему
     * значению на первом же ререндере стора (React возвращает `value` в DOM).
     */
    draftByKey: Record<string, string>;
    /** Ключи ответов, по которым запись прямо сейчас идёт в портал. */
    savingKeys: Record<string, boolean>;
    /**
     * Снимок значений CRM на момент, когда карточка вопроса появилась на
     * экране, — для пунктов с «обязательностью изменения»
     * (`requireChange`): такой пункт закрывается только ответом ЭТОЙ сессии,
     * и без снимка «записал то же, что стояло» считалось бы ответом.
     *
     * Первый снимок ключа побеждает (см. `baselineCaptured`): перезапись
     * после ответа превратила бы уже данный ответ в «то же значение» и снова
     * заперла бы отправку.
     */
    baselineByKey: Record<string, string>;
    error: string | null;
    /**
     * Код открытой модальной анкеты. Строка, а не union: коды анкет заводит
     * портал, и compile-time списка их не существует — от опечатки защищают
     * нормализатор каталога и валидация на бэке.
     */
    activeModalId: string | null;
    confirmed: Record<string, boolean>;
    pendingSend: boolean;
    baseDeal: {
        id: number | null;
        row: Record<string, unknown> | null;
        status: ChecklistBaseDealStatus;
    };
}

const initialState: CallChecklistState = {
    valueByKey: {},
    draftByKey: {},
    savingKeys: {},
    baselineByKey: {},
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
        setDraft(state, action: PayloadAction<{ key: string; value: string }>) {
            state.draftByKey[action.payload.key] = action.payload.value;
        },
        /** Запись поля ушла в портал. */
        saveStarted(state, action: PayloadAction<{ key: string }>) {
            state.savingKeys[action.payload.key] = true;
            state.error = null;
        },
        /** Портал принял значение — оно становится фактом, черновик не нужен. */
        saveSucceeded(
            state,
            action: PayloadAction<{ key: string; value: string }>,
        ) {
            state.valueByKey[action.payload.key] = action.payload.value;
            delete state.draftByKey[action.payload.key];
            delete state.savingKeys[action.payload.key];
        },
        /**
         * Портал не принял: черновик ОСТАЁТСЯ на экране (менеджер видит, что
         * пытался записать), значение-факт не подменяется.
         */
        saveFailed(
            state,
            action: PayloadAction<{ key: string; message: string }>,
        ) {
            delete state.savingKeys[action.payload.key];
            state.error = action.payload.message;
        },
        /**
         * Снимок значений для «обязательности изменения». Пишем ТОЛЬКО
         * отсутствующие ключи: повторный снимок (карточка перерисовалась,
         * модалка открылась второй раз) не имеет права затереть исходное
         * значение — иначе данный ответ станет равен снимку и пункт снова
         * окажется незакрытым.
         */
        baselineCaptured(
            state,
            action: PayloadAction<{ entries: Record<string, string> }>,
        ) {
            for (const [key, value] of Object.entries(action.payload.entries)) {
                if (key in state.baselineByKey) continue;
                state.baselineByKey[key] = value;
            }
        },
        setError(state, action: PayloadAction<{ message: string | null }>) {
            state.error = action.payload.message;
        },
        modalOpened(state, action: PayloadAction<{ id: string }>) {
            state.activeModalId = action.payload.id;
        },
        modalClosed(state) {
            state.activeModalId = null;
        },
        setPendingSend(state, action: PayloadAction<{ status: boolean }>) {
            state.pendingSend = action.payload.status;
        },
        setConfirmed(state, action: PayloadAction<{ id: string }>) {
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
        { key: string; value: string },
        'callChecklist/setDraft'
    >;
    saveStarted: ActionCreatorWithPayload<
        { key: string },
        'callChecklist/saveStarted'
    >;
    saveSucceeded: ActionCreatorWithPayload<
        { key: string; value: string },
        'callChecklist/saveSucceeded'
    >;
    saveFailed: ActionCreatorWithPayload<
        { key: string; message: string },
        'callChecklist/saveFailed'
    >;
    baselineCaptured: ActionCreatorWithPayload<
        { entries: Record<string, string> },
        'callChecklist/baselineCaptured'
    >;
    setError: ActionCreatorWithPayload<
        { message: string | null },
        'callChecklist/setError'
    >;
    modalOpened: ActionCreatorWithPayload<
        { id: string },
        'callChecklist/modalOpened'
    >;
    modalClosed: ActionCreatorWithoutPayload<'callChecklist/modalClosed'>;
    setPendingSend: ActionCreatorWithPayload<
        { status: boolean },
        'callChecklist/setPendingSend'
    >;
    setConfirmed: ActionCreatorWithPayload<
        { id: string },
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
