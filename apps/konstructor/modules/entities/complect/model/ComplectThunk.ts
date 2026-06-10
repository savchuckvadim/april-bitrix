import { createAsyncThunk } from '@reduxjs/toolkit';
import { IComplect } from '../type/complect.type';
import { RootState } from '@/modules/app';
import { getComplects, IComplectsResponse } from '../lib/complect.helper';

export const fetchComplects = createAsyncThunk<
    IComplectsResponse, // return type
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
            const domain = getState().app.domain;

            console.log('domain');
            console.log(domain);
            const complect = await getComplects(domain);

            if (!complect) {
                return rejectWithValue('Ошибка загрузки');
            }
            console.log('complect');
            console.log(complect);
            return complect;
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка загрузки');
        }
    },
);

export const initComplects = createAsyncThunk<
    IComplect[], // return type
    IComplect[], // argument type
    {
        state: RootState;
        rejectValue: string;
        extra: { getWSClient: () => void };
    }
>(
    'complect/fetchComplects',
    async (complects: IComplect[], { getState, rejectWithValue, extra }) => {
        try {

            if (!complects || complects.length === 0) {
                return rejectWithValue('Ошибка загрузки');
            }
            return complects;
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка загрузки');
        }
    },
);
