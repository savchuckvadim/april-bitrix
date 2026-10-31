import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PublicLinkMeta } from './types';

export type PublicAccessStatus = 'idle' | 'loading' | 'ready' | 'gone' | 'error';

export interface PublicAccessState {
    token: string | null;
    status: PublicAccessStatus;
    expiresAt: string | null;
}

const initialState: PublicAccessState = {
    token: null,
    status: 'idle',
    expiresAt: null,
};

/** Открыта ли страница по ссылке. linkGone заодно обнуляет весь стор: см. public-store. */
const publicAccessSlice = createSlice({
    name: 'publicAccess',
    initialState,
    reducers: {
        opening(state: PublicAccessState, action: PayloadAction<string>) {
            state.token = action.payload;
            state.status = 'loading';
        },
        opened(state: PublicAccessState, action: PayloadAction<PublicLinkMeta>) {
            state.status = 'ready';
            state.expiresAt = action.payload.expiresAt;
        },
        failed(state: PublicAccessState) {
            state.status = 'error';
        },
        linkGone(state: PublicAccessState) {
            state.status = 'gone';
        },
    },
});

export const publicAccessReducer = publicAccessSlice.reducer;
export const publicAccessActions = publicAccessSlice.actions;

export const selectPublicAccess = (state: {
    publicAccess: PublicAccessState;
}): PublicAccessState => state.publicAccess;
