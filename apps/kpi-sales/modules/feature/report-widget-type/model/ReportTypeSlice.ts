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
            // Гард от протухших сохранённых значений (ui-settings/share-снимки
            // могут содержать удалённую вкладку, напр. 'conversions') — иначе
            // отчёт рендерится пустым.
            state.current = Object.values(EReportType).includes(action.payload)
                ? action.payload
                : EReportType.All;
        },
    },
});
export const reportTypeActions = reportTypeSlice.actions;
export const reportTypeReducer = reportTypeSlice.reducer;
