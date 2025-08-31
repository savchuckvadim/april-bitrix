import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IOfferTemplate } from '../type/offer-template.type';

export interface IOfferTemplateState {
    items: IOfferTemplate[];
    current: IOfferTemplate | null;
}

const initialState: IOfferTemplateState = {
    items: [],
    current: null,
};

export const offerTemplateSlice = createSlice({
    name: 'offerTemplate',
    initialState,
    reducers: {
        setCurrent: (
            state: IOfferTemplateState,
            action: PayloadAction<IOfferTemplate>,
        ) => {
            state.current = action.payload;
        },
    },
});

export const { setCurrent } = offerTemplateSlice.actions;
export const offerTemplateReducer = offerTemplateSlice.reducer;
