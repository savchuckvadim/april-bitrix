import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { ClientContext } from '@/modules/app/lib/utills/app-state-util';
import { EV_PLAN_PROP } from '../type/event-plan-type';
import {
    getPlanInitState,
    isDifferenceMoreThanFourMonths,
} from '../lib/plan.util';

export type EventPlanState = typeof initialState;

// До первого init/clean — самый широкий набор: реальный контекст приезжает
// листенером на setAppData.
export const initialState = getPlanInitState(false, 'company');

const eventPlanSlice = createSlice({
    name: 'eventPlan',
    initialState,
    reducers: {
        init(
            state: EventPlanState,
            payload: PayloadAction<{ isTmc: boolean; context: ClientContext }>,
        ) {
            Object.assign(
                state,
                getPlanInitState(payload.payload.isTmc, payload.payload.context),
            );
        },
        setPlanProp: (
            state: EventPlanState,
            action: PayloadAction<{ name: EV_PLAN_PROP; value: string }>,
        ) => {
            const payload = action.payload;
            switch (payload.name) {
                case EV_PLAN_PROP.TYPE: {
                    const currentItem = state[EV_PLAN_PROP.TYPE].items.find(
                        item => item.id == Number(payload.value),
                    );
                    if (currentItem) state[EV_PLAN_PROP.TYPE].current = currentItem;
                    break;
                }
                case EV_PLAN_PROP.NAME:
                    state[EV_PLAN_PROP.NAME] = payload.value;
                    break;
                case EV_PLAN_PROP.DATE:
                    state[EV_PLAN_PROP.DATE] = payload.value;
                    state[EV_PLAN_PROP.IS_EXPIRED] = isDifferenceMoreThanFourMonths(
                        payload.value,
                    );
                    break;
                default:
                    break;
            }
        },
        setIsActive: (state: EventPlanState) => {
            state[EV_PLAN_PROP.IS_ACTIVE] = !state[EV_PLAN_PROP.IS_ACTIVE];
        },
        setIsImportant: (
            state: EventPlanState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state[EV_PLAN_PROP.IS_IMPORTANT] = action.payload.status;
        },
        setActiveStatus: (
            state: EventPlanState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state[EV_PLAN_PROP.IS_ACTIVE] = action.payload.status;
        },
        /**
         * Сброс плана к начальному состоянию. `context` обязателен: набор
         * типов события зависит от контекста клиента (в лиде доступен только
         * звонок), и без него после сброса развернулся бы полный список —
         * та самая регрессия «план оттопырился».
         */
        clean: (
            state: EventPlanState,
            action: PayloadAction<{ isTmc: boolean; context: ClientContext }>,
        ) => {
            Object.assign(
                state,
                getPlanInitState(action.payload.isTmc, action.payload.context),
            );
        },
    },
});

export const eventPlanReducer = eventPlanSlice.reducer;
export const eventPlanActions = eventPlanSlice.actions;
