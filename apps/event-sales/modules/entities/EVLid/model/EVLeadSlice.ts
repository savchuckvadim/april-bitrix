import { BXLead } from '@workspace/bx';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
    EV_LEAD_WORK_STATUS_CODE,
    EV_LEAD_WORK_STATUS_NAME,
    EVLeadWorkStatusItem,
} from '../type/event-lid-type';

export type EVLeadState = typeof initialState;

export const LEAD_STATUS_ITEMS: EVLeadWorkStatusItem[] = [
    { id: 0, code: EV_LEAD_WORK_STATUS_CODE.in_job, name: EV_LEAD_WORK_STATUS_NAME.in_job },
    { id: 1, code: EV_LEAD_WORK_STATUS_CODE.chok, name: EV_LEAD_WORK_STATUS_NAME.chok },
    { id: 2, code: EV_LEAD_WORK_STATUS_CODE.ch_region, name: EV_LEAD_WORK_STATUS_NAME.ch_region },
    { id: 3, code: EV_LEAD_WORK_STATUS_CODE.ok, name: EV_LEAD_WORK_STATUS_NAME.ok },
    { id: 4, code: EV_LEAD_WORK_STATUS_CODE.not_ca, name: EV_LEAD_WORK_STATUS_NAME.not_ca },
    { id: 5, code: EV_LEAD_WORK_STATUS_CODE.exist_in_job, name: EV_LEAD_WORK_STATUS_NAME.exist_in_job },
];

export const initialState = {
    lead: null as null | BXLead,
    status: {
        items: LEAD_STATUS_ITEMS,
        current: LEAD_STATUS_ITEMS[0]!,
    },
    isFetched: false as boolean,
    isLoading: false as boolean,
    errors: [] as string[],
    isGarantReportActive: false as boolean,
};

const leadSlice = createSlice({
    name: 'eventLead',
    initialState,
    reducers: {
        setCurrentLead: (
            state: EVLeadState,
            action: PayloadAction<{ lead: BXLead }>,
        ) => {
            state.lead = action.payload.lead;
        },
        setIsGarantReportActive: (
            state: EVLeadState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isGarantReportActive = action.payload.status;
        },
        clean: (state: EVLeadState) => {
            state.lead = null;
        },
    },
});

export const eventLeadReducer = leadSlice.reducer;
export const eventLeadActions = leadSlice.actions;
