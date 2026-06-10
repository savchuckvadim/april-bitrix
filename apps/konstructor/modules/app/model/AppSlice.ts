import { IBXCompany, IBXDeal } from '@bitrix/domain';
import { IBXUser } from '@bitrix/domain/interfaces/bitrix.interface';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { BXUser } from '@workspace/bx';

export type AppState = typeof initialState;
export enum APP_DEP {
    SALES = 'sales',
    SERVICE = 'service',
}
const initialState = {
    domain: '',
    bitrix: {
        user: null as IBXUser | null,
        deal: null as IBXDeal | null,
        company: null as IBXCompany | null,
    },

    department: APP_DEP.SERVICE,
    initialized: false,
    isLoading: false,
    error: {
        status: false as boolean,
        message: '' as string,
    },
    isSuperUser: false as boolean,
};
export interface InitApp {
    domain: string;
    user: IBXUser;
    deal: IBXDeal | null;
    company: IBXCompany;
}
const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setAppData: (
            state: AppState,
            action: PayloadAction<InitApp>,

        ) => {
            const payload = action.payload;
            state.domain = payload.domain;
            state.bitrix.user = payload.user;
            state.bitrix.deal = payload.deal;
            state.bitrix.company = payload.company;
            state.initialized = true;
        },

        setInitializedSuccess: (state: AppState, action: PayloadAction<{}>) => {
            state.initialized = true;
        },
        setInitializedError: (
            state: AppState,
            action: PayloadAction<{
                errorMessage: string;
            }>,
        ) => {
            state.initialized = true;
            state.error.status = true;
            state.error.message = action.payload.errorMessage;
        },
        setCleanError: (
            state: AppState,
            action: PayloadAction<{
                errorMessage: string;
            }>,
        ) => {
            state.error.status = false;
            state.error.message = '';
        },

        reload: (state: AppState, action: PayloadAction) => {
            state.initialized = false;
        },
        loading: (
            state: AppState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isLoading = action.payload.status;
        },

        setDepartment: (state: AppState, action: PayloadAction<APP_DEP>) => {
            state.department = action.payload;
        },
    },
});

export const appReducer = appSlice.reducer;

// Экспорт actions
export const appActions = appSlice.actions;
