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
    /** ID сделки из placement — вместе с domain ключ слепка bx_document_deals. */
    dealId: null as number | null,
    bitrix: {
        user: null as IBXUser | null,
        deal: null as IBXDeal | null,
        company: null as IBXCompany | null,
    },

    // отдел продаж по умолчанию; сервисный выставляет initPortal по категории сделки
    department: APP_DEP.SALES,
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
    company: IBXCompany | null;
    dealId: number | null;
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
            state.dealId = payload.dealId;
            state.bitrix.user = payload.user;
            state.bitrix.deal = payload.deal;
            state.bitrix.company = payload.company;
            state.initialized = true;
        },

        /** Сделка создана отправкой из конструктора (deal-send без dealId) */
        setDealId: (state: AppState, action: PayloadAction<number>) => {
            state.dealId = action.payload;
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

        /** Точечная правка полей компании после записи в Битрикс (прогноз, статус). */
        patchCompany: (
            state: AppState,
            action: PayloadAction<Record<string, unknown>>,
        ) => {
            if (!state.bitrix.company) return;
            Object.assign(state.bitrix.company, action.payload);
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
