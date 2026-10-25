import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Provider } from './dto';

export type DocumentProviderStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface DocumentProviderState {
    items: Provider[];
    /** Выбранный поставщик — от него зависит налог (withTax) и реквизиты документов. */
    current: Provider | null;
    status: DocumentProviderStatus;
    error: string | null;
}

const initialState: DocumentProviderState = {
    items: [],
    current: null,
    status: 'idle',
    error: null,
};

export const documentProviderSlice = createSlice({
    name: 'documentProvider',
    initialState,
    reducers: {
        loading(state: DocumentProviderState) {
            state.status = 'loading';
            state.error = null;
        },
        /** Список загружен; текущий — переданный id, иначе прежний, иначе первый. */
        setFetched(
            state: DocumentProviderState,
            action: PayloadAction<{ providers: Provider[]; currentId: string | null }>,
        ) {
            const { providers, currentId } = action.payload;
            const wantedId = currentId ?? state.current?.id ?? null;
            state.items = providers;
            state.current =
                providers.find(provider => provider.id === wantedId) ??
                providers[0] ??
                null;
            state.status = 'ready';
            state.error = null;
        },
        setCurrent(state: DocumentProviderState, action: PayloadAction<string>) {
            state.current =
                state.items.find(provider => provider.id === action.payload) ??
                state.current;
        },
        failed(state: DocumentProviderState, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
    },
});

export const documentProvidertAC = documentProviderSlice.actions;
export const documentProviderReducer = documentProviderSlice.reducer;
