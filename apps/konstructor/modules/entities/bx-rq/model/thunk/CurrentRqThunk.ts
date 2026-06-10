import { RootState } from '@/modules/app/model/store';
import { setCurrentRq } from '@/modules/entities/deal';
import { BitrixService } from '@bitrix/index';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const setCurrentRqThunk = createAsyncThunk(
    'bx-rq/setCurrentRq',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const deal = state.app.bitrix.deal;
            const dealId = deal?.ID;
            const rqId = state.bxrq.current.item?.bx_id;

            if (!dealId || !rqId) {
                return rejectWithValue('dealId or rqId is not defined');
            }

            await setCurrentRq(dealId, rqId);

            //TODO: update deal in app reducer
        } catch (error) {
            return rejectWithValue(error);
        }
    },
);
