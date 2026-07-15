import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { EV_PLAN_PROP } from '../type/event-plan-type';
import {
    getInitialDate,
    getPlanInitState,
    isDifferenceMoreThanFourMonths,
    PLAN_CALL_TYPES,
} from '../lib/plan-util';

export type EventPlanState = typeof initialState;

export const initialState = getPlanInitState(false);

const eventPlanSlice = createSlice({
    name: 'eventPlan',
    initialState,
    reducers: {
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
        setFinishStatus: (state: EventPlanState) => {
            state[EV_PLAN_PROP.TYPE] = {
                items: PLAN_CALL_TYPES,
                current: PLAN_CALL_TYPES[0]!,
                isChanged: false,
            };
            state[EV_PLAN_PROP.NAME] = '';
            state[EV_PLAN_PROP.DATE] = getInitialDate().current;
        },
        setIsActive: (state: EventPlanState) => {
            state[EV_PLAN_PROP.IS_ACTIVE] = !state[EV_PLAN_PROP.IS_ACTIVE];
        },
        setActiveStatus: (
            state: EventPlanState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state[EV_PLAN_PROP.IS_ACTIVE] = action.payload.status;
        },
        clean: (
            state: EventPlanState,
            action: PayloadAction<{ isTmc: boolean }>,
        ) => {
            Object.assign(state, getPlanInitState(action.payload.isTmc));
        },
    },
});

export const eventPlanReducer = eventPlanSlice.reducer;
export const eventPlanActions = eventPlanSlice.actions;
