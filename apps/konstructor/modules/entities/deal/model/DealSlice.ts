import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { handleSliceError } from '@/modules/app/lib/thunk-error-handler';
import { updateDealField } from './DealThunk';

export interface IDealState {
    // dealData: IDealFieldsData[] | null; pbx fields
    dealId: number | null;
    loading: boolean;
    fetched: boolean;
    error: string | null;
    isUpdating: boolean;
}

const initialState: IDealState = {
    // dealData: null,
    dealId: null,
    loading: false,
    fetched: false,
    error: null,
    isUpdating: false,
};

const pbxDealSlice = createSlice({
    name: 'pbxDeal',
    initialState,
    reducers: {
        // setDealData: (state: IDealState, action: PayloadAction<IDealFieldsData[]>) => {
        //     state.dealData = action.payload;

        //     state.error = null;
        //     state.fetched = true;
        // },
        // setDealId: (state: IDealState, action: PayloadAction<number>) => {
        //     state.dealId = action.payload;
        // },
        // updateFieldValue: (
        //     state: IDealState,
        //     action: PayloadAction<{
        //         fieldKey: string;
        //         value: string | number;
        //     }>,
        // ) => {
        //     const { fieldKey, value } = action.payload;

        //     if (state.dealData) {
        //         const field = state.dealData.find(
        //             field => field.code === fieldKey,
        //         );

        //         if (field) {
        //             (field as IDealFieldsData).value = value.toString() as
        //                 | string
        //                 | string[]
        //                 | number;
        //             state.dealData = state.dealData.map(fld =>
        //                 fld.code === fieldKey ? field : fld,
        //             );
        //         }
        //     }
        // },
        // clearDeal: (state: IDealState) => {
        //     state.dealData = null;
        //     state.dealId = null;
        //     state.error = null;
        // },
        // setError: (state: IDealState, action: PayloadAction<string>) => {
        //     state.error = action.payload;
        //     state.fetched = true;
        // },
        // clearError: state => {
        //     state.error = null;
        // },
    },
    extraReducers: builder => {
        // updateDealField
        builder.addCase(updateDealField.pending, state => {
            state.isUpdating = true;
            state.error = null;
        });
        builder.addCase(updateDealField.fulfilled, state => {
            state.isUpdating = false;
            state.error = null;
            state.fetched = true;
        });
        builder.addCase(updateDealField.rejected, (state, action) => {
            state.isUpdating = false;
            state.error = handleSliceError(
                action,
                'Ошибка обновления поля сделки',
            );
            state.fetched = true;
        });
    },
});

// export const {
//     setDealData,
//     setDealId,
//     updateFieldValue,
//     clearDeal,
//     setError,
//     clearError,
// } = dealSlice.actions;

export const dealReducer = pbxDealSlice.reducer;
