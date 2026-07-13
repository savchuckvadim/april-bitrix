
import { PayloadAction, createSlice } from "@reduxjs/toolkit";


//проведено презентаций smart
// UF_CRM_10_1709111529 - april
// 	UF_CRM_6_1709894507 - alfa
// компании 
// UF_CRM_1709807026


//TYPES
export type PresentationState = typeof initialState


export enum PresentationProp {
    COUNT = 'count',
    IS_PRESENTATION_DONE = 'isPresentationDone',
    IS_UNPLANNED_PRESENTATION = 'isUnplannedPresentation'
}
export enum PresentationCountProp {
    COMPANY = 'company',
    SMART = 'smart',
    DEAL = 'deal',
}
export interface PresentationStateCount {
    [PresentationCountProp.COMPANY]: number,
    [PresentationCountProp.SMART]: number,
    [PresentationCountProp.DEAL]: number,
}



const initialState = {
    [PresentationProp.COUNT]: {
        [PresentationCountProp.COMPANY]: 0 as number,
        [PresentationCountProp.SMART]: 0 as number,
        [PresentationCountProp.DEAL]: 0 as number,

    } as PresentationStateCount,
    [PresentationProp.IS_PRESENTATION_DONE]: false as boolean,
    [PresentationProp.IS_UNPLANNED_PRESENTATION]: false as boolean,

}

const eventPresentationSlice = createSlice({
    name: 'eventPresentation',
    initialState,
    reducers: {
        // setFetchedDepartament: (
        //     state: StateType,
        //     action: PayloadAction<SetFetchedDepartamentProps>
        // ) => {
        //     state = state
        // },
        setPresentationCount: (
            state: PresentationState,
            action: PayloadAction<{
                count: number,
                entityType: PresentationCountProp
            }>

        ) => {
            const payload = action.payload;
            state.count[payload.entityType] = payload.count
        },
        setPresentationProp: (
            state: PresentationState,
            action: PayloadAction<{
                name: PresentationProp,
                value: boolean
            }>

        ) => {
            const payload = action.payload;
            if (payload.name != PresentationProp.COUNT) {
                state[payload.name] = payload.value
            }

        },

    },

});


export const eventPresentationReducer = eventPresentationSlice.reducer;

// Экспорт actions
export const eventPresentationActions = eventPresentationSlice.actions;