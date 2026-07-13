import { EV_SERVICE_PLAN_CODE } from "@/modules/entities/EventPlan/type/event-plan-service-type";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";


export type ServiceResultsState = Record<
  EV_SERVICE_PLAN_CODE.LEARNING |
  EV_SERVICE_PLAN_CODE.LEARNING_FIRST |
  EV_SERVICE_PLAN_CODE.PRESENTATION |
  EV_SERVICE_PLAN_CODE.SS,
  boolean
>;

const initialState = {
  [EV_SERVICE_PLAN_CODE.LEARNING]: false,
  [EV_SERVICE_PLAN_CODE.LEARNING_FIRST]: false,
  [EV_SERVICE_PLAN_CODE.PRESENTATION]: false,
  [EV_SERVICE_PLAN_CODE.SS]: false,
};

const serviceResultsSlice = createSlice({
  name: "serviceResults",
  initialState,
  reducers: {
    setInit: (
      state: ServiceResultsState,
      action: PayloadAction<{
        prop: keyof ServiceResultsState;
      }>
    ) => {
      const prop = action.payload.prop;

      Object.keys(state).forEach((key) => {
        state[key as keyof ServiceResultsState] = key === prop ? true : false;
      });
    },

    setProp: (
      state: ServiceResultsState,
      action: PayloadAction<{
        prop: keyof ServiceResultsState;
      }>
    ) => {
      const payload = action.payload;
      state[payload.prop] = !state[payload.prop];
    },

    clean: (
      state: ServiceResultsState,
      action: PayloadAction
    ) => {

      state[EV_SERVICE_PLAN_CODE.LEARNING] = false;
      state[EV_SERVICE_PLAN_CODE.LEARNING_FIRST] = false;
      state[EV_SERVICE_PLAN_CODE.PRESENTATION] = false;
      state[EV_SERVICE_PLAN_CODE.SS] = false;

    },
  },
});

export const serviceResultsReducer = serviceResultsSlice.reducer;

// Экспорт actions
export const serviceResultsActions = serviceResultsSlice.actions;
