import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/modules/app/model/store';
import { IBaseTemplate } from '../type/base-template.type';
import { getBaseTemplate } from '../lib/base-template.helper';
import { initDefaultLetter } from '../../offer-template-block';

export const fetchBaseTemplate = createAsyncThunk<
    {
        template: IBaseTemplate;
    },
    { domain?: string } | void,
    {
        state: RootState;
        rejectValue: string;
        extra: { getWSClient: () => void };
    }
>(
    'baseTemplate/fetchBaseTemplate',
    async (params, { getState, dispatch, rejectWithValue, extra }) => {
        const state = getState();
        const domain = params?.domain;

        try {
            if (domain) {
                const response = await getBaseTemplate(domain);

                if (!response) {
                    return rejectWithValue('Ошибка загрузки');
                }
                const text = response.template.letter;
                dispatch(initDefaultLetter({ text }));

                return response;
            }
            return rejectWithValue('Ошибка загрузки отсуттствует domain');
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка загрузки');
        }
    },
);
