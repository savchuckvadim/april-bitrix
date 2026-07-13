
import { BXLead } from "@workspace/bx";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EV_SS_BXCHECKBOX, EV_SS_CheckList } from "../type/event-ss-type";




//TYPES
export type EVServiceSignalState = typeof initialState





export const initialState = {
    reportURL: '' as string,
    instructionText: '' as string,
    motivationText: '' as string,
    checklists: null as null | EV_SS_CheckList[],
    isFetched: false as boolean,
    isLoading: false as boolean,
    isActive: false as boolean,
    errors: [] as string[],


}

const serviceSignalSlice = createSlice({
    name: 'serviceSignal',
    initialState,
    reducers: {
        setFetchedCheckBoxes: (
            state: EVServiceSignalState,
            action: PayloadAction<{
                checkLists: EV_SS_CheckList[] | null
                reportURL: string,
                instructionText: string,
                motivationText: string,
            }>

        ) => {
            const data = action.payload
            state.checklists = data.checkLists
            state.reportURL = data.reportURL
            state.instructionText = data.instructionText
            state.motivationText = data.motivationText
            state.isFetched = true
            state.isLoading = false
        },
        setActiveStatus: (
            state: EVServiceSignalState,
            action: PayloadAction<{ status: boolean }>

        ) => {

            state.isActive = action.payload.status
        },
        setLoadingStatus: (
            state: EVServiceSignalState,
            action: PayloadAction<{ status: boolean }>

        ) => {

            state.isLoading =  action.payload.status
        },
        check: (
            state: EVServiceSignalState,
            action: PayloadAction<{ checkboxId:number, newValue: boolean }>

        ) => {

            state.checklists = state.checklists.map(checklist => ({
                ...checklist,
                checkboxes: checklist.checkboxes.map(checkbox => checkbox.ID === action.payload.checkboxId? {...checkbox, IS_COMPLETE: action.payload.newValue ? 'Y' : 'N' } : checkbox)
            }))
        },
        clean: (
            state: EVServiceSignalState, action: PayloadAction
        ) => {
            state.reportURL = ''
            state.checklists = null
            state.isActive = false
            state.errors = []
            state.isFetched = false
            state.isLoading = false

        }
    },

});

export const serviceSignalReducer = serviceSignalSlice.reducer;

// Экспорт actions
export const serviceSignalActions = serviceSignalSlice.actions;

