import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PeriodFilter, TimelineMode, TimelineState } from "../types";

const initialState: TimelineState = {
    periodFilter: {
        startDate: new Date(2025, 0, 1).toISOString(),
        endDate: new Date(2025, 11, 31).toISOString(),
        clientStatus: 'all',
        indexStatus: 'all',
        assignedUsers: []
    },
    timelineMode: 'detailed',
    expandedCompanies: []
};

const timelineSlice = createSlice({
    name: 'timeline',
    initialState,
    reducers: {
        setPeriodFilter: (state, action: PayloadAction<Partial<PeriodFilter>>) => {
            state.periodFilter = { ...state.periodFilter, ...action.payload };
        },
        setTimelineMode: (state, action: PayloadAction<TimelineMode>) => {
            state.timelineMode = action.payload;
        },
        toggleCompany: (state, action: PayloadAction<number>) => {
            const companyId = action.payload;
            const exists = state.expandedCompanies.includes(companyId);
            state.expandedCompanies = exists
                ? state.expandedCompanies.filter(id => id !== companyId)
                : [...state.expandedCompanies, companyId];
        },
        setExpandedCompanies: (state, action: PayloadAction<number[]>) => {
            state.expandedCompanies = action.payload;
        },
        resetTimeline: (state) => {
            state.periodFilter = initialState.periodFilter;
            state.timelineMode = initialState.timelineMode;
            state.expandedCompanies = initialState.expandedCompanies;
        }
    }
});

export const {
    setPeriodFilter,
    setTimelineMode,
    toggleCompany,
    setExpandedCompanies,
    resetTimeline
} = timelineSlice.actions;

export const timelineReducer = timelineSlice.reducer;
