import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { EV_DEAL_PROP } from '../type/event-deal-type';

export type EventDealFieldState = {
    /** UF_CRM_<bitrixId> поля сделки, например UF_CRM_CONTRACT_START */
    bitrixId: string;
    /** значение в формате yyyy-MM-dd (для input type="date") или '' */
    current: string;
};

export type EventDealState = {
    /** сделка найдена (из плейсмента или через компанию) и pbx-поля есть */
    isActive: boolean;
    /** ID сделки: при COMPANY-плейсменте она найдена через service_base */
    dealId: number | null;
    [EV_DEAL_PROP.CONTRACT_START]: EventDealFieldState;
    [EV_DEAL_PROP.CONTRACT_END]: EventDealFieldState;
};

const initialState: EventDealState = {
    isActive: false,
    dealId: null,
    [EV_DEAL_PROP.CONTRACT_START]: { bitrixId: '', current: '' },
    [EV_DEAL_PROP.CONTRACT_END]: { bitrixId: '', current: '' },
};

const eventDealSlice = createSlice({
    name: 'eventDeal',
    initialState,
    reducers: {
        setInit: (
            state: EventDealState,
            action: PayloadAction<{
                dealId: number;
                contractStart: EventDealFieldState;
                contractEnd: EventDealFieldState;
            }>,
        ) => {
            state.isActive = true;
            state.dealId = action.payload.dealId;
            state[EV_DEAL_PROP.CONTRACT_START] = action.payload.contractStart;
            state[EV_DEAL_PROP.CONTRACT_END] = action.payload.contractEnd;
        },

        setCurrentProp: (
            state: EventDealState,
            action: PayloadAction<{ prop: EV_DEAL_PROP; value: string }>,
        ) => {
            state[action.payload.prop].current = action.payload.value;
        },

        clean: (state: EventDealState) => {
            state.isActive = false;
            state.dealId = null;
            state[EV_DEAL_PROP.CONTRACT_START] = { bitrixId: '', current: '' };
            state[EV_DEAL_PROP.CONTRACT_END] = { bitrixId: '', current: '' };
        },
    },
});

export const eventDealReducer = eventDealSlice.reducer;
export const eventDealActions = eventDealSlice.actions;
