import {
    createSlice,
    type ActionCreatorWithoutPayload,
    type ActionCreatorWithPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';

/**
 * Записанные вручную хвост-значения поверх строки сделки (строка
 * перечитывается только на reload) и ошибка записи.
 *
 * Ключ — `<dealId>:<code>`: значения не утекают в другую сделку при смене
 * контекста. На reload оверрайды сбрасываются (каталог reload-reset):
 * записанное уже лежит в CRM и приедет со свежей строкой, а поле могли
 * поменять и снаружи приложения — без сброса оверрайд навсегда прятал бы
 * чужую правку под своим значением.
 */
export interface XvostFieldsState {
    valueByKey: Record<string, string>;
    error: string | null;
}

const initialState: XvostFieldsState = { valueByKey: {}, error: null };

export const xvostOverrideKey = (dealId: number, code: string): string =>
    `${dealId}:${code}`;

const xvostFieldsSlice = createSlice({
    name: 'xvostFields',
    initialState,
    reducers: {
        setValue(
            state,
            action: PayloadAction<{
                dealId: number;
                code: string;
                value: string;
            }>,
        ) {
            const { dealId, code, value } = action.payload;
            state.valueByKey[xvostOverrideKey(dealId, code)] = value;
        },
        setError(state, action: PayloadAction<{ message: string | null }>) {
            state.error = action.payload.message;
        },
        /** Полный сброс (reloadApp): свежая строка CRM — источник истины. */
        reset: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const xvostFieldsActions: {
    setValue: ActionCreatorWithPayload<
        { dealId: number; code: string; value: string },
        'xvostFields/setValue'
    >;
    setError: ActionCreatorWithPayload<
        { message: string | null },
        'xvostFields/setError'
    >;
    reset: ActionCreatorWithoutPayload<'xvostFields/reset'>;
} = xvostFieldsSlice.actions;

export const xvostFieldsReducer: Reducer<XvostFieldsState> =
    xvostFieldsSlice.reducer;
