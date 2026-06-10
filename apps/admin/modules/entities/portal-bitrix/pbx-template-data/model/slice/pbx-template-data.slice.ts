import { createSlice } from '@reduxjs/toolkit';
import type { PbxGroupDefinitionDto } from '@workspace/nest-api';
import { fetchInitialPbxTemplateDataThunk } from '../thunk/fetch-initial-pbx-template-data.thunk';

export interface IPbxTemplateDataState {
    /**
     * All groups from the PBX registry.
     * Each group (sales, tmc, service, general) contains the full set of
     * entity definitions: smarts, rpas, fields, deal, lead, contact, etc.
     */
    allData: PbxGroupDefinitionDto[];
    isLoading: boolean;
    error: string | null;
    initialized: boolean;
}

const initialState: IPbxTemplateDataState = {
    allData: [],
    isLoading: false,
    error: null,
    initialized: false,
};

const pbxTemplateDataSlice = createSlice({
    name: 'pbxTemplateData',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchInitialPbxTemplateDataThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchInitialPbxTemplateDataThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.allData = action.payload.allData;
            state.initialized = true;
        });
        builder.addCase(fetchInitialPbxTemplateDataThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message ?? 'Unknown error';
        });
    },
});

export const pbxTemplateDataReducer = pbxTemplateDataSlice.reducer;
