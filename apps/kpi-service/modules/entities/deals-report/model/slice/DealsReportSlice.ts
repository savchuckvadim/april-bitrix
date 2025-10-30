import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { OrkReportDealsByCompaniesDto } from "@workspace/nest-api"
import { getDealsReport } from "../thunk/DealsReportThunk"

export type DealsReportState = {
    deals: OrkReportDealsByCompaniesDto[]
    error: string | null
    isLoading: boolean
}

export const initialState: DealsReportState = {
    deals: [] as OrkReportDealsByCompaniesDto[],
    error: null as string | null,
    isLoading: false as boolean
}

const dealsReportSlice = createSlice({
    name: 'dealsReport',
    initialState,
    reducers: {
        setDealsReport: (state: DealsReportState, action: PayloadAction<OrkReportDealsByCompaniesDto[]>) => {
            state.deals = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getDealsReport.fulfilled, (state: DealsReportState, action) => {
            state.deals = action.payload
            state.isLoading = false
        })
        builder.addCase(getDealsReport.rejected, (state: DealsReportState, action) => {
            state.error = action.payload ?? 'Unknown error'
            state.isLoading = false
        })
        builder.addCase(getDealsReport.pending, (state: DealsReportState) => {
            state.isLoading = true
        })
    }
})

export const { setDealsReport } = dealsReportSlice.actions

export const dealsReportReducer = dealsReportSlice.reducer
