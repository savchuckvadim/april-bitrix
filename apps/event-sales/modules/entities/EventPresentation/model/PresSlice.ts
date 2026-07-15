import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type PresentationState = typeof initialState;

export enum PresentationProp {
    COUNT = 'count',
    IS_PRESENTATION_DONE = 'isPresentationDone',
    IS_UNPLANNED_PRESENTATION = 'isUnplannedPresentation',
}

export enum PresentationCountProp {
    COMPANY = 'company',
    SMART = 'smart',
    DEAL = 'deal',
}

export interface PresentationStateCount {
    [PresentationCountProp.COMPANY]: number;
    [PresentationCountProp.SMART]: number;
    [PresentationCountProp.DEAL]: number;
}

const initialState = {
    [PresentationProp.COUNT]: {
        [PresentationCountProp.COMPANY]: 0,
        [PresentationCountProp.SMART]: 0,
        [PresentationCountProp.DEAL]: 0,
    } as PresentationStateCount,
    [PresentationProp.IS_PRESENTATION_DONE]: false as boolean,
    [PresentationProp.IS_UNPLANNED_PRESENTATION]: false as boolean,
};

const eventPresentationSlice = createSlice({
    name: 'eventPresentation',
    initialState,
    reducers: {
        setPresentationCount: (
            state: PresentationState,
            action: PayloadAction<{
                count: number;
                entityType: PresentationCountProp;
            }>,
        ) => {
            state.count[action.payload.entityType] = action.payload.count;
        },
        setPresentationProp: (
            state: PresentationState,
            action: PayloadAction<{ name: PresentationProp; value: boolean }>,
        ) => {
            if (action.payload.name != PresentationProp.COUNT) {
                state[action.payload.name] = action.payload.value;
            }
        },
        clean: (state: PresentationState) => {
            state[PresentationProp.IS_PRESENTATION_DONE] = false;
            state[PresentationProp.IS_UNPLANNED_PRESENTATION] = false;
        },
    },
});

export const eventPresentationReducer = eventPresentationSlice.reducer;
export const eventPresentationActions = eventPresentationSlice.actions;
