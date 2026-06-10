import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithPreparedPayload,
    type PayloadAction,
} from '@reduxjs/toolkit';

import { PROVIDER_KEY, type Provider } from '../type/provider.type';

export interface ProviderUser {
    id: number;
    providerName: string;
    domain: string;
    bxUserId: number;
    agentId: number;
}

export type DocumentProviderState = {
    isActive: boolean;
    isFetched: boolean;
    items: Provider[];
    current: Provider | null;
    user: ProviderUser | null;
};

export type ProviderStateType = DocumentProviderState;

const initialState: DocumentProviderState = {
    isActive: false,
    isFetched: false,
    items: [],
    current: null,
    user: null,
};

function resolveCurrent(providers: Provider[], currentProvider: Provider | null): Provider | null {
    return currentProvider || (providers.length > 0 ? providers[0]! : null);
}

export const documentProviderSlice = createSlice({
    name: 'documentProvider',
    initialState,
    reducers: {
        setFetched: {
            reducer(
                state: DocumentProviderState,
                action: PayloadAction<{ providers: Provider[]; currentProvider: Provider | null }>,
            ) {
                const { providers, currentProvider } = action.payload;
                state.items = providers;
                state.current = resolveCurrent(providers, currentProvider);
                state.isFetched = true;
            },
            prepare(providers: Provider[], currentProvider: Provider | null) {
                return { payload: { providers, currentProvider } };
            },
        },
        setInit: {
            reducer(
                state: DocumentProviderState,
                action: PayloadAction<{ providers: Provider[]; currentProvider: Provider | null }>,
            ) {
                const { providers, currentProvider } = action.payload;
                state.items = providers;
                state.current = resolveCurrent(providers, currentProvider);
                state.isFetched = true;
            },
            prepare(providers: Provider[], currentProvider: Provider | null) {
                return { payload: { providers, currentProvider } };
            },
        },
        setProviderUser: (state: DocumentProviderState, action: PayloadAction<ProviderUser>) => {
            state.user = action.payload;
        },
        setCurrent: (state: DocumentProviderState, action: PayloadAction<number>) => {
            const id = action.payload;
            state.current = state.items.find(item => item[PROVIDER_KEY.ID] === id) ?? null;
        },
    },
});

/** Явная форма экшенов без вывода типов через immer (TS7056 / portable .d.ts). */
// export type DocumentProvidertAC = {
//     setFetched: ActionCreatorWithPreparedPayload<
//         [Provider[], Provider | null],
//         { providers: Provider[]; currentProvider: Provider | null },
//         'documentProvider/setFetched'
//     >;
//     setInit: ActionCreatorWithPreparedPayload<
//         [Provider[], Provider | null],
//         { providers: Provider[]; currentProvider: Provider | null },
//         'documentProvider/setInit'
//     >;
//     setProviderUser: ActionCreatorWithPayload<ProviderUser, 'documentProvider/setProviderUser'>;
//     setCurrent: ActionCreatorWithPayload<number, 'documentProvider/setCurrent'>;
// };

export const documentProvidertAC = documentProviderSlice.actions;
export const documentProviderReducer = documentProviderSlice.reducer;
