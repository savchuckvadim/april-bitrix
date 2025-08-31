import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IComplect } from '../type/complect.type';
import { fetchComplects } from './ComplectThunk';

export interface complectState {
    prof: IComplect[];
    universal: IComplect[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: complectState = {
    prof: [] as IComplect[],
    universal: [] as IComplect[],
    loading: 'idle',
};

export const complectSlice = createSlice({
    name: 'complect',
    initialState,
    reducers: {
        setFetched: (
            state: complectState,
            action: PayloadAction<IComplect[]>,
        ) => {
            state.prof = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchComplects.pending, state => {
            state.loading = 'pending';
        });
        builder.addCase(fetchComplects.fulfilled, (state, action) => {
            state.prof = action.payload;
            state.loading = 'succeeded';
        });
    },
});

export const { setFetched } = complectSlice.actions;
export const complectReducer = complectSlice.reducer;
