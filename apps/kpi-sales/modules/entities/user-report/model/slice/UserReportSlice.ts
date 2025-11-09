import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserReportItem } from "../../type/user-report.type";
import { getUserReportThunk, stopLoadingUserReportThunk } from "../thunk/UserReportThunk";
import { OrkUserReportStartResponseDto, SalesUserReportStartResponseDto } from "@workspace/nest-api";

export interface IUserReportState {
    current: IUserReportItem[];
    reports: IUserReportItem[];
    isLoading: boolean;
    isFetched: boolean;
    isFirstFetched: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    currentItem: number;
    operationId: string | null;
    listId: number | null;
}

const initialState: IUserReportState = {
    current: [],
    reports: [],
    isLoading: false,
    isFirstFetched: false,
    isFetched: false,
    operationId: null as string | null,
    error: null,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
    currentItem: 0,
    listId: null,
}



const userReportSlice = createSlice({
    name: 'userReport',
    initialState,
    reducers: {
        setCurrentUserReport: (state: IUserReportState, action: PayloadAction<IUserReportItem[]>) => {
            state.current = action.payload;
        },
        setProgressFetchedReport: (state: IUserReportState, action: PayloadAction<IUserReportItem[]>) => {
            state.isFirstFetched = true;
            if (state.reports.some(report => action.payload.some(item => item.id === report.id))) {
                return;
            }
            state.reports = [...state.reports, ...action.payload];

        },
        setFullFetchedReport: (state: IUserReportState, action: PayloadAction<boolean>) => {
            state.isLoading = false;
            state.isFirstFetched = action.payload;
            state.isFetched = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getUserReportThunk.fulfilled, (state: IUserReportState, action: PayloadAction<SalesUserReportStartResponseDto | null>) => {
            if (!action.payload) {
                return;
            }
            state.operationId = action.payload.operationId;
            state.listId = action.payload.listId;
        })
        // builder.addCase(getUserReportThunk.rejected, (state: IUserReportState, action) => {
        //     state.error = action.payload ?? 'Unknown error';
        //     state.isLoading = false;
        // })
        builder.addCase(getUserReportThunk.pending, (state: IUserReportState) => {
            state.isLoading = true;
            state.error = null;
        })
        builder.addCase(stopLoadingUserReportThunk.fulfilled, (state: IUserReportState, action: PayloadAction<OrkUserReportStartResponseDto>) => {
            state.operationId = null;
            state.isLoading = false;
            state.isFetched = false;
            state.reports = [];
            state.current = [];
            state.currentPage = 1;
            state.totalPages = 1;
            state.pageSize = 10;
            state.totalItems = 0;
            state.currentItem = 0;
        })
    }
});

export const userReportActions = userReportSlice.actions;

export const userReportReducer = userReportSlice.reducer;
