import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import type { ImpersonationSession } from '../lib/impersonation.util';

export type ImpersonationState = ImpersonationSession;

const initialState: ImpersonationState = {
    realUser: null,
    target: null,
};

/**
 * Режим «работать как». В reload-reset НЕ входит: бут перезапускается
 * именно для того, чтобы подхватить сотрудника. Живёт в памяти фрейма —
 * закрыли приложение, режим кончился.
 */
const impersonationSlice = createSlice({
    name: 'impersonation',
    initialState,
    reducers: {
        started: (
            state: ImpersonationState,
            action: PayloadAction<{ realUser: BXUser; target: BXUser }>,
        ) => {
            state.realUser = action.payload.realUser;
            state.target = action.payload.target;
        },
        stopped: () => initialState,
    },
});

export const impersonationReducer = impersonationSlice.reducer;
export const impersonationActions = impersonationSlice.actions;
