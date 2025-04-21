import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Portal } from "../type/portal-type";


//TYPES
export type EventReportState = typeof initialState


export interface SetPortalProps {
    portal: Portal
}

const initialState = {

    portal: null as null | Portal,
    isFetched: false as boolean,
    error: '',


}


const portalSlice = createSlice({
    name: 'Portal',
    initialState,
    reducers: {

        setPortal: (
            state: EventReportState,
            action: PayloadAction<SetPortalProps>

        ) => {
            const payload = action.payload;

            state.portal = payload.portal
        },

    },

    // extraReducers: (builder) => {
    //     builder
    //         .addMatcher(
    //             portalAPI.endpoints.fetchPortal.matchFulfilled,
    //             (state, { payload }) => {
    //                 if (payload) {
    //                     state.portal = payload;
    //                     state.isFetched = true;
    //                     state.error = '';
    //                 }
    //             }
    //         )
    //         .addMatcher(
    //             portalAPI.endpoints.fetchPortal.matchRejected,
    //             (state, action) => {
    //                 state.isFetched = true;
    //                 state.error = 'ошибка получения portal';
    //             }
    //         );
    // }

});




//utils


export const portalReducer = portalSlice.reducer;

// Экспорт actions
export const portalActions = portalSlice.actions;