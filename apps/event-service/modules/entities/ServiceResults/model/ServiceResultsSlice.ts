import { EV_SERVICE_PLAN_CODE } from "@/modules/entities/EventPlan/type/event-plan-service-type";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";


// любой доступный тип события можно отметить как спонтанный результат
export type ServiceResultsState = Record<EV_SERVICE_PLAN_CODE, boolean>;

const initialState = Object.values(EV_SERVICE_PLAN_CODE).reduce((acc, code) => {
  acc[code] = false;
  return acc;
}, {} as ServiceResultsState);

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

      Object.keys(state).forEach((key) => {
        state[key as keyof ServiceResultsState] = false;
      });

    },
  },
});

export const serviceResultsReducer = serviceResultsSlice.reducer;

// Экспорт actions
export const serviceResultsActions = serviceResultsSlice.actions;
