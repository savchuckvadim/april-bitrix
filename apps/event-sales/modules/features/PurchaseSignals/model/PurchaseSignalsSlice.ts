import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';

/**
 * Локальное состояние дат покупки/конкурентов: введённые значения поверх
 * строки сущности (строка перечитывается только на reload) и ошибка записи.
 */
export interface PurchaseSignalsState {
    valueByCode: Record<string, string>;
    /** Коды выбранных конкурентов поверх строки; null — правок не было. */
    concurentCodes: string[] | null;
    error: string | null;
}

const initialState: PurchaseSignalsState = {
    valueByCode: {},
    concurentCodes: null,
    error: null,
};

const purchaseSignalsSlice = createSlice({
    name: 'purchaseSignals',
    initialState,
    reducers: {
        setValue(
            state,
            action: PayloadAction<{ code: string; value: string }>,
        ) {
            state.valueByCode[action.payload.code] = action.payload.value;
        },
        setConcurents(state, action: PayloadAction<{ codes: string[] }>) {
            state.concurentCodes = action.payload.codes;
        },
        setError(state, action: PayloadAction<{ message: string | null }>) {
            state.error = action.payload.message;
        },
        /** Полный сброс: reloadApp перечитает значения из сущности. */
        reset: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const purchaseSignalsActions: {
    setValue: ActionCreatorWithPayload<
        { code: string; value: string },
        'purchaseSignals/setValue'
    >;
    setConcurents: ActionCreatorWithPayload<
        { codes: string[] },
        'purchaseSignals/setConcurents'
    >;
    setError: ActionCreatorWithPayload<
        { message: string | null },
        'purchaseSignals/setError'
    >;
    reset: ActionCreatorWithoutPayload<'purchaseSignals/reset'>;
} = purchaseSignalsSlice.actions;

export const purchaseSignalsReducer: Reducer<PurchaseSignalsState> =
    purchaseSignalsSlice.reducer;
