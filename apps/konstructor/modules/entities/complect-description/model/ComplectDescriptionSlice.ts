import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ComplectDescriptionResponse } from './dto';

export type ComplectDescriptionStatus = 'idle' | 'loading' | 'done' | 'error';

export interface ComplectDescriptionState {
    status: ComplectDescriptionStatus;
    /** Ссылка на готовый DOCX (последняя генерация) */
    link: string | null;
    documentName: string | null;
    infoblocksCount: number;
    error: string | null;
}

const initialState: ComplectDescriptionState = {
    status: 'idle',
    link: null,
    documentName: null,
    infoblocksCount: 0,
    error: null,
};

/** «Описание комплекта» — состояние генерации DOCX по наполнению главной строки. */
const complectDescriptionSlice = createSlice({
    name: 'complectDescription',
    initialState,
    reducers: {
        started(state: ComplectDescriptionState) {
            state.status = 'loading';
            state.error = null;
        },
        done(state: ComplectDescriptionState, action: PayloadAction<ComplectDescriptionResponse>) {
            state.status = 'done';
            state.link = action.payload.link;
            state.documentName = action.payload.documentName;
            state.infoblocksCount = action.payload.infoblocksCount;
        },
        failed(state: ComplectDescriptionState, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
        /** Наполнение изменилось или сделка сменилась — старая ссылка уже не про неё */
        reset() {
            return initialState;
        },
    },
});

export const complectDescriptionReducer = complectDescriptionSlice.reducer;
export const complectDescriptionActions = complectDescriptionSlice.actions;

interface WithComplectDescription {
    complectDescription: ComplectDescriptionState;
}

export const selectComplectDescription = (state: WithComplectDescription) => state.complectDescription;
