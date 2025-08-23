import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { APP_TYPE } from "../types/app/app-type";
import { Portal } from "../types/portal/portal-type";
import type { BXUser } from "@workspace/bx";

export type AppState = typeof initialState;
export enum APP_DEP {
  SALES = "sales",
  SERVICE = "service",
}
const initialState = {
  domain: "",
  app: APP_TYPE.REPORT as APP_TYPE,
  bitrix: {
    user: null as BXUser | null,
  },
  client: {
    id: "",
    name: "",
    isExpired: false,
    isPunished: false,
  },

  department: APP_DEP.SERVICE,
  portal: null as Portal | null,
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
      action: PayloadAction<InitReport>,
      //   {
      //     domain: string;
      //     user: BXUser | null;

      //   }
    ) => {
      const payload = action.payload;
      state.domain = payload.domain;
      state.bitrix.user = payload.user;
      state.initialized = true;
      if (state.domain === "gsirk.bitrix24.ru") {
        state.client.isExpired = true;
      }
    },

    setInitializedSuccess: (state: AppState, action: PayloadAction<{}>) => {
      state.initialized = true;
    },
    setInitializedError: (
      state: AppState,
      action: PayloadAction<{
        errorMessage: string;
      }>,
    ) => {
      state.initialized = true;
      state.error.status = true;
      state.error.message = action.payload.errorMessage;
    },
    setCleanError: (
      state: AppState,
      action: PayloadAction<{
        errorMessage: string;
      }>,
    ) => {
      state.error.status = false;
      state.error.message = "";
    },
    setPortal: (
      state: AppState,
      action: PayloadAction<{
        portal: Portal;
      }>,
    ) => {
      state.portal = action.payload.portal;
    },
    reload: (state: AppState, action: PayloadAction) => {
      state.initialized = false;
    },
    loading: (state: AppState, action: PayloadAction<{ status: boolean }>) => {
      state.isLoading = action.payload.status;
    },
    setExpiredClient: (state: AppState, action: PayloadAction<{ isExpired: boolean }>) => {
      state.client.isExpired = action.payload.isExpired;
    },
  },
});

export const appReducer = appSlice.reducer;

// Экспорт actions
export const appActions = appSlice.actions;
