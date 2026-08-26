import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { APP_DISPLAY_MODE, APP_TYPE } from '../../types/app/app-type';
import {
    BXCompany,
    BXDeal,
    BXLead,
    BXTask,
    BXUser,
    Placement,
} from '@workspace/bx';
import {
    DomainFeatureConfig,
    getDomainConfig,
} from '../../consts/domain-config';

export type AppState = typeof initialState;

export enum APP_DEP {
    SALES = 'sales',
    SERVICE = 'service',
}
export enum APP_FROM_ENUM {
    COMPANY = 'company',
    LEAD = 'lead',
    DEAL = 'deal', // имеется в виду только deal_empty -
    // DEAL_EMPTY = 'deal_empty',
    // DEAL_WITH_COMPANY = 'deal_with_company',
    // TASK = 'task', // не имеет смысла мы на основе информации из task должны выбрать
    //предыдущие
    // CALL_CARD = 'call_card',
}
/**
 * Полноэкранные заглушки-гварды вместо приложения (todo2508):
 * - `foreignTask` — открылись из задачи ЧУЖОЙ группы (не «Звонки» ОП);
 * - `noTaskEntity` — у задачи не осталось живых привязок (компания/сделка/лид
 *   удалены) — работать не с чем.
 */
export type AppGuard = 'foreignTask' | 'noTaskEntity';

const initialState = {
    domain: '',
    app: APP_TYPE.EVENT as APP_TYPE,
    guard: null as AppGuard | null,
    bitrix: {
        user: null as BXUser | null,
        company: null as BXCompany | null,
        deal: null as BXDeal | null,
        lead: null as BXLead | null,
        placement: null as null | Placement,
        task: null as BXTask | null,
        from: null as APP_FROM_ENUM | null,
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
    /**
     * fetchAppConfig отработал (успехом ИЛИ ошибкой): портальные настройки
     * уже легли поверх хардкода — или их не будет. Потребители, которым
     * настройка нужна к ПЕРВОМУ запросу (initialEventTasks: taskGroupId),
     * ждут этот флаг с таймаутом (fail-open на хардкод).
     */
    isConfigFetched: false as boolean,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        isLoading: (
            state: AppState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
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
                from: APP_FROM_ENUM;
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
            state.bitrix.from = payload.from;

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
        /**
         * Портальные настройки с бэка (админка → Settings → event-sales)
         * ложатся ПОВЕРХ legacy-хардкода domain-config: сервер недоступен —
         * остаётся прежнее поведение (безопасный переезд с хардкода).
         */
        mergeConfig: (
            state: AppState,
            action: PayloadAction<Partial<DomainFeatureConfig>>,
        ) => {
            state.config = { ...state.config, ...action.payload };
        },
        /** fetchAppConfig завершился (и при ошибке тоже — fail-open). */
        setConfigFetched: (state: AppState) => {
            state.isConfigFetched = true;
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
        setGuard: (state: AppState, action: PayloadAction<AppGuard | null>) => {
            state.guard = action.payload;
        },
        reload: (state: AppState) => {
            state.initialized = false;
            state.guard = null;
        },
    },
});

export const appReducer = appSlice.reducer;
export const appActions = appSlice.actions;
