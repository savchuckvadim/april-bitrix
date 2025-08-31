import { createAsyncThunk } from '@reduxjs/toolkit';
import { IComplect } from '../type/complect.type';
import { RootState } from '@/modules/app';
import { getComplects } from '../lib/complect.helper';

export const fetchComplects = createAsyncThunk<
    IComplect[], // return type
    void, // argument type
    {
        state: RootState;
        rejectValue: string;
        extra: { getWSClient: () => void };
    }
>(
    'complect/fetchComplects',
    async (_, { getState, rejectWithValue, extra }) => {
        try {
            const complect = await getComplects();

            if (!complect || complect.length === 0) {
                return rejectWithValue('Ошибка загрузки');
            }
            return complect;
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка загрузки');
        }
    },
);
