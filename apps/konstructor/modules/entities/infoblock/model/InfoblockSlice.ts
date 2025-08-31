import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IInfoBlock, IInfoBlockGroup } from '../type/infoblock.type';
import { fetchInfoblocks } from './InfoblockThunk';

export interface InfoblockState {
    infoblocks: IInfoBlock[];
    groups: IInfoBlockGroup[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
}
const initialState: InfoblockState = {
    infoblocks: [],
    groups: [],
    loading: 'idle',
};

const infoblockSlice = createSlice({
    name: 'infoblock',
    initialState,
    reducers: {
        setFetchedInfoblocks: (
            state: InfoblockState,
            action: PayloadAction<IInfoBlock[]>,
        ) => {
            state.infoblocks = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchInfoblocks.pending, state => {
            state.loading = 'pending';
        });
        builder.addCase(fetchInfoblocks.fulfilled, (state, action) => {
            state.infoblocks = action.payload.infoblocks;
            state.groups = action.payload.groups;
            state.loading = 'succeeded';
        });
    },
});

export const {} = infoblockSlice.actions;
export const infoblockReducer = infoblockSlice.reducer;
