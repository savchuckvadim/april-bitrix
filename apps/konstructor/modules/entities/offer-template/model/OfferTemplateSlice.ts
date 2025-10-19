import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IOfferTemplate } from '../type/offer-template.type';
import { fetchOfferTemplates, saveOfferTemplateThunk } from './OfferTemplateThunk';
import { OfferTemplateSummaryDto } from '@workspace/nest-api';
import { OfferTemplateDto } from '@workspace/nest-api';

export interface IOfferTemplateState {
    items: OfferTemplateSummaryDto[];
    current: OfferTemplateDto | IOfferTemplate | null;
    isSaving: boolean;
    isLoading: boolean;
}

const initialState: IOfferTemplateState = {
    items: [],
    current: null,
    isSaving: false,
    isLoading: false,
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
    extraReducers: (builder) => {

        builder.addCase(fetchOfferTemplates.fulfilled, (state, action) => {
            state.items = action.payload;
            state.isLoading = false;
        });

        builder.addCase(fetchOfferTemplates.pending, (state, action) => {
            state.isLoading = true;
        });


        builder.addCase(fetchOfferTemplates.rejected, (state, action) => {
            state.isLoading = false;
        });

        builder.addCase(saveOfferTemplateThunk.fulfilled, (state, action) => {
            state.current = action.payload;

            // @ts-ignore
            state.items = state.items.map(item => item.id === action.payload.id ? action.payload : item);
            state.isSaving = false;
        });
        builder.addCase(saveOfferTemplateThunk.pending, (state, action) => {
            state.isSaving = true;
        });
        builder.addCase(saveOfferTemplateThunk.rejected, (state, action) => {
            state.isSaving = false;
        });
    },
});

export const { setCurrent } = offerTemplateSlice.actions;
export const offerTemplateReducer = offerTemplateSlice.reducer;
