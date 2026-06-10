import { createAsyncThunk } from '@reduxjs/toolkit';
import { BitrixFieldHelper } from '../../lib/api/pbx-template-data.api';
import type { PbxGroupDefinitionDto } from '@workspace/nest-api';

export interface PbxTemplateDataPayload {
    allData: PbxGroupDefinitionDto[];
}

export const fetchInitialPbxTemplateDataThunk = createAsyncThunk<
    PbxTemplateDataPayload,
    void
>(
    'pbxTemplateData/fetchInitialPbxTemplateData',
    async (_, { rejectWithValue }) => {
        try {
            const api = new BitrixFieldHelper();
            const allData = await api.getAllPbxTemplateData();
            return { allData };
        } catch (error) {
            return rejectWithValue(error);
        }
    },
);
