import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { APP_DISPLAY_MODE, APP_TYPE } from '../../types/app/app-type';
import { BXCompany, BXDeal, BXLead, BXTask, BXUser, Placement } from '@workspace/bx';
import { DomainFeatureConfig, getDomainConfig } from '../../consts/domain-config';

export type AppState = typeof initialState;

export enum APP_DEP {
    SALES = 'sales',
    SERVICE = 'service',
}

const initialState = {
    domain: '',
    app: APP_TYPE.EVENT as APP_TYPE,
    bitrix: {
        user: null as BXUser | null,
        company: null as BXCompany | null,
        deal: null as BXDeal | null,
        lead: null as BXLead | null,
        placement: null as null | Placement,
        task: null as BXTask | null,
    },

    display: {
        mode: APP_DISPLAY_MODE.PUBLIC as APP_DISPLAY_MODE,
    },

    department: APP_DEP.SALES,
    isResized: false,
    initialized: false,
    isLoading: false,
    error: {
        status: false as boolean,
        message: '' as string,
    },
    config: getDomainConfig('') as DomainFeatureConfig,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        isLoading: (state: AppState, action: PayloadAction<{ status: boolean }>) => {
            state.isLoading = action.payload.status;
        },
        setAppData: (
            state: AppState,
            action: PayloadAction<{
                domain: string;
                user: BXUser | null;
                placement: Placement | null;
                deal: BXDeal | null;
                company: BXCompany | null;
                lead: BXLead | null;
                display: APP_DISPLAY_MODE;
                task: BXTask | null;
            }>,
        ) => {
            const payload = action.payload;
            state.domain = payload.domain;
            state.bitrix.placement = payload.placement;
            state.bitrix.user = payload.user;
            state.bitrix.company = payload.company;
            state.bitrix.deal = payload.deal;
            state.bitrix.task = payload.task;
            state.bitrix.lead = payload.lead;
            state.display.mode = payload.display;

            state.config = getDomainConfig(payload.domain, payload.user);
        },
        setAppBitrixData: (
            state: AppState,
            action: PayloadAction<{
                company: null | BXCompany;
                deal: null | BXDeal;
            }>,
        ) => {
            state.bitrix.company = action.payload.company;
            state.bitrix.deal = action.payload.deal;
        },
        setInitializedSuccess: (state: AppState, action: PayloadAction<{}>) => {
            state.initialized = true;
        },
        setInitializedError: (
            state: AppState,
            action: PayloadAction<{ errorMessage: string }>,
        ) => {
            state.initialized = true;
            state.error.status = true;
            state.error.message = action.payload.errorMessage;
        },
        setCleanError: (state: AppState) => {
            state.error.status = false;
            state.error.message = '';
        },
        reload: (state: AppState) => {
            state.initialized = false;
        },
    },
});

export const appReducer = appSlice.reducer;
export const appActions = appSlice.actions;
