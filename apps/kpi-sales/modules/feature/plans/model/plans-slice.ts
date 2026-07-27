import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
    PlanIndicatorConfig,
    PlanIndicatorMeta,
    PlansConfig,
    PlanTargetsByCode,
} from './index';

export type PlansLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type PlansSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface PlansState {
    status: PlansLoadStatus;
    /** Каталог показателей (справочник с бэка). */
    catalog: PlanIndicatorMeta[];
    /** Портальный конфиг (включённость/имена/период-типы). */
    indicators: PlanIndicatorConfig[];
    /** Планы сотрудников: userId → (code → значение|null). */
    targetsByUser: Record<number, PlanTargetsByCode>;
    /** Статус сохранения из диалога настроек. */
    saveStatus: PlansSaveStatus;
    saveError: string | null;
}

const initialState: PlansState = {
    status: 'idle',
    catalog: [],
    indicators: [],
    targetsByUser: {},
    saveStatus: 'idle',
    saveError: null,
};

/**
 * Планы руководителя: каталог+конфиг портала и цели сотрудников
 * (из Bitrix user-полей). Достижение НЕ хранится — считается селекторами/
 * утилями из данных отчётов при рендере.
 */
const plansSlice = createSlice({
    name: 'plans',
    initialState,
    reducers: {
        loading: (state: PlansState) => {
            state.status = 'loading';
        },
        ready: (
            state: PlansState,
            action: PayloadAction<{
                catalog: PlanIndicatorMeta[];
                config: PlansConfig;
                targetsByUser: Record<number, PlanTargetsByCode>;
            }>,
        ) => {
            state.status = 'ready';
            state.catalog = action.payload.catalog;
            state.indicators = action.payload.config.indicators;
            state.targetsByUser = action.payload.targetsByUser;
        },
        error: (state: PlansState) => {
            state.status = 'error';
        },
        saving: (state: PlansState) => {
            state.saveStatus = 'saving';
            state.saveError = null;
        },
        saved: (
            state: PlansState,
            action: PayloadAction<{
                config: PlansConfig;
                targetsByUser: Record<number, PlanTargetsByCode>;
            }>,
        ) => {
            state.saveStatus = 'saved';
            state.indicators = action.payload.config.indicators;
            state.targetsByUser = action.payload.targetsByUser;
        },
        saveError: (state: PlansState, action: PayloadAction<string>) => {
            state.saveStatus = 'error';
            state.saveError = action.payload;
        },
        resetSaveStatus: (state: PlansState) => {
            state.saveStatus = 'idle';
            state.saveError = null;
        },
    },
});

export const plansReducer = plansSlice.reducer;
export const plansActions = plansSlice.actions;
