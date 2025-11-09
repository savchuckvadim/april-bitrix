import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EReportType } from "../consts/report-type.consts";


export type ReportTypeState = {
    current: EReportType;
}
const initialState: ReportTypeState = {

    current: EReportType.All,
}
export const reportTypeSlice = createSlice({
    name: 'reportType',
    initialState,
    reducers: {
        setCurrentReportType: (state: ReportTypeState, action: PayloadAction<EReportType>) => {
            state.current = action.payload;
        },
    },
});
export const reportTypeActions = reportTypeSlice.actions;
export const reportTypeReducer = reportTypeSlice.reducer;
