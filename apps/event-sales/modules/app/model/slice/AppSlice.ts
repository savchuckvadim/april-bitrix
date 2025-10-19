import { PayloadAction, createSlice } from "@reduxjs/toolkit"

import { APP_DISPLAY_MODE, APP_TYPE } from "../../types/app/app-type"
import { BXCompany, BXDeal, BXLead, BXTask, BXUser, Placement } from "@workspace/bx";


export type AppState = typeof initialState
export enum APP_DEP {
    SALES = 'sales',
    SERVICE = 'service',
}
const initialState = {
    domain: '',
    app: APP_TYPE.EVENT as APP_TYPE,
    bitrix: {
        user: null as BXUser | null,
        company: null as BXCompany | null,
        deal: null as BXDeal | null,
        lead: null as BXLead | null,
        placement: null as null | Placement,
        task: null as BXTask | null
    },

    display: {
        mode: APP_DISPLAY_MODE.PUBLIC as APP_DISPLAY_MODE
    },

    department: APP_DEP.SALES,
    // portal: null as Portal | null,
    isResized: false,
    initialized: false,
    isLoading: false,
    error: {
        status: false as boolean,
        message: '' as string
    },
    config: {
        withNoPlan: false,
        withNoReschedle: false, //перенос
        withPostFail: false,
        withNoCall: false,
        withTM: false,
        withRecords: false,
        withTranscribation: false,
        withAI: false,
        withPresentationAnimate: false,
        withColorRequired: false,
    }


}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        isLoading: (
            state: AppState,
            action: PayloadAction<
                {
                    status: boolean

                }
            >
        ) => {

            state.isLoading = action.payload.status;
        },
        setAppData: (
            state: AppState,
            action: PayloadAction<
                {
                    domain: string,
                    user: BXUser | null,
                    placement: Placement | null,
                    deal: BXDeal | null,
                    company: BXCompany | null,
                    lead: BXLead | null,
                    display: APP_DISPLAY_MODE
                    // isTask: boolean,
                    task: BXTask | null

                }
            >
        ) => {
            const payload = action.payload;
            state.domain = payload.domain;
            state.bitrix.placement = payload.placement;
            state.bitrix.user = payload.user;
            state.bitrix.company = payload.company;
            state.bitrix.deal = payload.deal;
            state.bitrix.task = payload.task;
            state.bitrix.lead = payload.lead;



            console.log('setAppBitrixData')
            console.log(state.domain)
            console.log(state.bitrix.placement)
            console.log(state.bitrix.user)
            console.log(state.bitrix.company)
            console.log(state.bitrix.deal)
            console.log('task')
            console.log(state.bitrix.task)
            console.log('lead')
            console.log(state.bitrix.lead)


            state.display.mode = action.payload.display
            state.config.withRecords = true


            if (state.domain == 'april-dev.bitrix24.ru' ||
                state.domain == 'gsirk.bitrix24.ru') {
                state.config.withNoPlan = true
                state.config.withNoReschedle = true
                state.config.withPostFail = true
                state.config.withPresentationAnimate = true
                state.config.withColorRequired = true
            }

            if (state.domain == 'gsr.bitrix24.ru') {
                state.config.withTM = true
            }
            if (state.domain == 'april-garant.bitrix24.ru') {


                if (Number(payload.user?.ID) === 222) {
                    state.config.withRecords = true
                    state.config.withTranscribation = true
                    state.config.withAI = true

                }

            }

            if (payload.user?.LAST_NAME === 'Савчук') {
                state.config.withRecords = true
                state.config.withTranscribation = true
                state.config.withAI = true

            }

            // console.log('display')
            // console.log(state.display.mode)

        },
        setAppBitrixData: (
            state: AppState,
            action: PayloadAction<
                {
                    company: null | BXCompany,
                    deal: null | BXDeal,
                }
            >
        ) => {
            const payload = action.payload;
            state.bitrix.company = payload.company
            state.bitrix.deal = payload.deal

        },
        setInitializedSuccess: (
            state: AppState,
            action: PayloadAction<{}>
        ) => {
            state.initialized = true
        },
        setInitializedError: (
            state: AppState,
            action: PayloadAction<{
                errorMessage: string
            }>
        ) => {

            state.initialized = true
            state.error.status = true
            state.error.message = action.payload.errorMessage
        },
        setCleanError: (
            state: AppState,
            action: PayloadAction<{
                errorMessage: string
            }>
        ) => {

            state.error.status = false
            state.error.message = ''
        },
        // setPortal: (
        //     state: AppState,
        //     action: PayloadAction<{
        //         portal: Portal
        //     }>
        // ) => {
        //     state.portal = action.payload.portal
        // },
        reload: (
            state: AppState,
            action: PayloadAction

        ) => {
            state.initialized = false
        }
    },

});

export const appReducer = appSlice.reducer;

// Экспорт actions
export const appActions = appSlice.actions;
