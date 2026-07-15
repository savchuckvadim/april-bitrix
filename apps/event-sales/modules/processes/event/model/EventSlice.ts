import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { BXCompany, Placement } from '@workspace/bx';
import {
    EV_ERROR_CODE,
    EventCurrentErrors,
    SetErrorsPayload,
    SetFinishStatusPayload,
    SetFullCompleteStatusPayload,
} from '../types/event-types';

export type EventState = typeof initialState;

// event — корневой процесс флоу: общие данные страниц, финиш-статус и
// ошибки валидации. Текущий роут им НЕ хранится — навигация нативная Next
// (useEventNavigation).

export const emptyErrors: EventCurrentErrors = {
    [EV_ERROR_CODE.COMMENT]: '',
    [EV_ERROR_CODE.PLAN_NAME]: '',
    [EV_ERROR_CODE.PLAN_TYPE]: '',
    [EV_ERROR_CODE.POST_FAIL_DATE]: '',
    [EV_ERROR_CODE.CONTACT_NAME]: '',
    [EV_ERROR_CODE.CONTACT_PHONE]: '',
    [EV_ERROR_CODE.CONTACT_EMAIL]: '',
    [EV_ERROR_CODE.CONTACT_POST]: '',
};

const initialState = {
    placement: null as null | Placement,
    company: null as BXCompany | null,

    isFullComplete: false,
    isFinish: false,
    result: '' as string,
    errors: {
        isError: false as boolean,
        current: { ...emptyErrors } as EventCurrentErrors,
    },
};

const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        setFullCompleteStatus: (
            state: EventState,
            action: PayloadAction<SetFullCompleteStatusPayload>,
        ) => {
            state.isFullComplete = action.payload.status;
        },
        setFinishStatus: (
            state: EventState,
            action: PayloadAction<SetFinishStatusPayload>,
        ) => {
            state.isFinish = action.payload.status;
            state.result = action.payload.result;
            state.isFullComplete = false;
            state.errors.isError = false;
            state.errors.current = { ...emptyErrors };
        },
        setErrors(state: EventState, action: PayloadAction<SetErrorsPayload>) {
            state.errors.isError = action.payload.isError;
            state.errors.current = action.payload.errors;
        },
        setError(
            state: EventState,
            action: PayloadAction<{ code: EV_ERROR_CODE; value: string }>,
        ) {
            state.errors.current[action.payload.code] = action.payload.value;
            state.errors.isError = Object.values(state.errors.current).some(Boolean);
        },
        cleanErrors(state: EventState) {
            state.errors.isError = false;
            state.errors.current = { ...emptyErrors };
        },
    },
});

export const eventReducer = eventSlice.reducer;
export const eventActions = eventSlice.actions;
