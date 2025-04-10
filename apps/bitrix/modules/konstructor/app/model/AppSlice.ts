import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { APP_TYPE } from "../types/app/app-type";
import { Portal } from "../types/portal/portal-type";
import type {
  Placement,
  BXCompany,
  BXDeal,
  BXLead,
  BXTask,
  BXUser,
  InitBxResult,
  PlacementCallCard,
} from "@workspace/bx";
import { DISPLAY_MODE } from "@workspace/bx";

export type AppState = typeof initialState;
export enum APP_DEP {
  SALES = "sales",
  SERVICE = "service",
}
const initialState = {
  domain: "",
  app: APP_TYPE.EVENT as APP_TYPE,
  bitrix: {
    user: null as BXUser | null,
    company: null as BXCompany | null,
    deal: null as BXDeal | null,
    lead: null as BXLead | null,
    placement: null as null | Placement | PlacementCallCard,
    task: null as BXTask | null,
  },

  display: {
    mode: DISPLAY_MODE.PUBLIC as DISPLAY_MODE,
  },

  department: APP_DEP.SERVICE,
  portal: null as Portal | null,
  isResized: false,
  initialized: false,
  isLoading: false,
  error: {
    status: false as boolean,
    message: "" as string,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppData: (
      state: AppState,
      action: PayloadAction<InitBxResult>
      //   {
      //     domain: string;
      //     user: BXUser | null;
      //     placement: Placement | null;
      //     deal: BXDeal | null;
      //     company: BXCompany | null;
      //     display: DISPLAY_MODE;
      //     // isTask: boolean,
      //     task: BXTask | null;
      //   }
    ) => {
      const payload = action.payload;
      state.domain = payload.domain;
      state.bitrix.placement = payload.placement;
      state.bitrix.user = payload.user;
      state.bitrix.company = payload.company;
      state.bitrix.deal = payload.deal;
      state.bitrix.task = payload.task;

      // !__IS_PROD__ && console.log('setAppBitrixData')
      // !__IS_PROD__ && console.log(state.domain)
      // !__IS_PROD__ && console.log(state.bitrix.placement)
      // !__IS_PROD__ && console.log(state.bitrix.user)
      // !__IS_PROD__ && console.log(state.bitrix.company)
      // !__IS_PROD__ && console.log(state.bitrix.deal)

      // !__IS_PROD__ && console.log('task')
      // !__IS_PROD__ && console.log(state.bitrix.task)

      state.display.mode = action.payload.display;

      // console.log('display')
      // console.log(state.display.mode)
    },
    setAppBitrixData: (
      state: AppState,
      action: PayloadAction<{
        company: null | BXCompany;
        deal: null | BXDeal;
      }>
    ) => {
      const payload = action.payload;
      state.bitrix.company = payload.company;
      state.bitrix.deal = payload.deal;
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
    setPortal: (
      state: AppState,
      action: PayloadAction<{
        portal: Portal;
      }>
    ) => {
      state.portal = action.payload.portal;
    },
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
