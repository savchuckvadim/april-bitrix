import { createAsyncThunk } from '@reduxjs/toolkit';
import { IOfferTemplate } from '../type/offer-template.type';
import { RootState } from '@/modules/app';

export const fetchOfferTemplates = createAsyncThunk<
    IOfferTemplate[], // return type
    void, // argument type
    {
        state: RootState;
        rejectValue: string;
        extra: { getWSClient: () => void };
    }
>(
    'offerTemplate/fetchTemplates',
    async (_, { getState, rejectWithValue, extra }) => {
        try {
            return [];
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка загрузки');
        }
    },
);
