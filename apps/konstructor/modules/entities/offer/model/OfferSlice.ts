import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IOffer } from '../type/offer.type';

export interface OfferState {
    current: IOffer | null;
}

const initialState: OfferState = {
    current: null,
};

export const offerSlice = createSlice({
    name: 'offer',
    initialState,
    reducers: {
        setCurrent: (state: OfferState, action: PayloadAction<IOffer>) => {
            state.current = action.payload;
        },
    },
});

export const { setCurrent } = offerSlice.actions;
export const offerReducer = offerSlice.reducer;
