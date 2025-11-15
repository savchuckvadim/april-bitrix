import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AuthState, AuthStateDto } from '../types';


const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    currentUser: null,
    currentClient: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state: AuthState, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setCurrentUser: (state: AuthState, action: PayloadAction<AuthStateDto | null>) => {
            debugger
            state.currentUser = action.payload?.currentUser ?? null;
            state.currentClient = action.payload?.currentClient ?? null;
            state.isAuthenticated = action.payload?.currentUser
                && action.payload?.currentClient
                ? true
                : false;
        },
        loginSuccess: (state: AuthState, action: PayloadAction<AuthStateDto>) => {

            state.currentUser = action.payload.currentUser;
            state.currentClient = action.payload.currentClient;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
        loginFailure: (state: AuthState, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        registerSuccess: (state: AuthState, action: PayloadAction<AuthStateDto>) => {
            state.currentUser = action.payload.currentUser;
            state.currentClient = action.payload.currentClient;
            // state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
        registerFailure: (state: AuthState, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        logout: (state: AuthState) => {
            state.currentUser = null;
            state.currentClient = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state: AuthState) => {
            state.error = null;
        },
    },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
