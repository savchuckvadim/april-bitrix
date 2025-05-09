import { PayloadAction, createSlice } from "@reduxjs/toolkit";


import type {
  BXUser,
} from "@workspace/bx";

export type AppState = typeof initialState;
export enum APP_DEP {
  SALES = "sales",
  SERVICE = "service",
}
const initialState = {
  domain: "",
  bitrix: {
    user: null as BXUser | null,

  },


  department: APP_DEP.SERVICE,
  initialized: false,
  isLoading: false,
  error: {
    status: false as boolean,
    message: "" as string,
  },
};
export interface InitReport {
  domain: string;
  user: BXUser;
 

}
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppData: (
      state: AppState,
      action: PayloadAction<InitReport>
      //   {
      //     domain: string;
      //     user: BXUser | null;

      //   }
    ) => {
      const payload = action.payload;
      state.domain = payload.domain;
      state.bitrix.user = payload.user;
      state.initialized = true;


    },

    setInitializedSuccess: (state: AppState, action: PayloadAction<{}>) => {
      state.initialized = true;
    },
    setInitializedError: (
      state: AppState,
      action: PayloadAction<{
        errorMessage: string;
      }>
    ) => {
      state.initialized = true;
      state.error.status = true;
      state.error.message = action.payload.errorMessage;
    },
    setCleanError: (
      state: AppState,
      action: PayloadAction<{
        errorMessage: string;
      }>
    ) => {
      state.error.status = false;
      state.error.message = "";
    },
    // setPortal: (
    //   state: AppState,
    //   action: PayloadAction<{
    //     portal: Portal;
    //   }>
    // ) => {
    //   state.portal = action.payload.portal;
    // },
    reload: (
      state: AppState,
      action: PayloadAction

    ) => {
      state.initialized = false
    },
    loading: (
      state: AppState,
      action: PayloadAction<{status:boolean}>

    ) => {
      state.isLoading = action.payload.status
    }
  },
});

export const appReducer = appSlice.reducer;

// Экспорт actions
export const appActions = appSlice.actions;
