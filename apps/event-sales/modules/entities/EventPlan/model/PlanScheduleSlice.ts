import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** Событие занятости дня для таймлайна TimePicker. */
export interface PlanScheduleEvent {
    time: string;
    title: string;
    type: string;
}

const initialState = {
    /** дата 'yyyy-MM-dd', для которой загружено расписание (кэш) */
    date: '' as string,
    items: [] as PlanScheduleEvent[],
    isLoading: false as boolean,
};

export type PlanScheduleState = typeof initialState;

const planScheduleSlice = createSlice({
    name: 'planSchedule',
    initialState,
    reducers: {
        setFetched: (
            state: PlanScheduleState,
            action: PayloadAction<{ date: string; items: PlanScheduleEvent[] }>,
        ) => {
            state.date = action.payload.date;
            state.items = action.payload.items;
            state.isLoading = false;
        },
        setLoading: (
            state: PlanScheduleState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isLoading = action.payload.status;
        },
    },
});

export const planScheduleReducer = planScheduleSlice.reducer;
export const planScheduleActions = planScheduleSlice.actions;
