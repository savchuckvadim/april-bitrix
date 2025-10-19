import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBaseTemplate } from '../type/base-template.type';
import { fetchBaseTemplate } from './BaseTemplateThunk';
import { handleSliceError } from '@/modules/app/lib/thunk-error-handler';

export interface IBaseTemplateState {
    current: IBaseTemplate | null;

    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
}
const initialState: IBaseTemplateState = {
    current: null,
    loading: 'idle',
};

const baseTemplateSlice = createSlice({
    name: 'baseTemplate',
    initialState,
    reducers: {
        setFetchedInfoblocks: (
            state: IBaseTemplateState,
            action: PayloadAction<IBaseTemplate>,
        ) => {
            state.current = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchBaseTemplate.pending, state => {
            state.loading = 'pending';
        });
        builder.addCase(fetchBaseTemplate.fulfilled, (state, action) => {
            state.current = action.payload.template;

            state.loading = 'succeeded';
        });
        builder.addCase(fetchBaseTemplate.rejected, (state, action) => {
            // handleSliceError(
            //     action,
            //     'Ошибка загрузки базового шаблона',
            // );
        });
    },
});

export const { } = baseTemplateSlice.actions;
export const baseTemplateReducer = baseTemplateSlice.reducer;
