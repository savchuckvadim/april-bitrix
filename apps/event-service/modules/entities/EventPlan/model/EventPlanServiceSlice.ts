import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EV_PLAN_SERVICE_PROP, EventPlanServiceCall } from "../type/event-plan-service-type";
import { createInitialStatePlanItems, getInitialDate } from "../lib/sevice/plan-service-util";
import { isDifferenceMoreThanFourMonths } from "./EventPlanServiceThunk";

//TYPES
export type EventPlanServiceState = typeof initialState;

export interface EV_PLAN_STATE_SERVICE_ITEM {
  items: Array<EventPlanServiceCall>;
  current: EventPlanServiceCall;
  isChanged: boolean;
}
const servicePlanItem = createInitialStatePlanItems();
export const initialState = {
  [EV_PLAN_SERVICE_PROP.TYPE]: {
    items: servicePlanItem as Array<EventPlanServiceCall>,
    current: servicePlanItem[0] as EventPlanServiceCall,
    isChanged: false as boolean,
  } as EV_PLAN_STATE_SERVICE_ITEM,
  [EV_PLAN_SERVICE_PROP.NAME]: "",
  [EV_PLAN_SERVICE_PROP.DATE]: getInitialDate().current as string,
  [EV_PLAN_SERVICE_PROP.TIME]: null as string | null,
  [EV_PLAN_SERVICE_PROP.IS_ACTIVE]: true as boolean,
  [EV_PLAN_SERVICE_PROP.IS_EXPIRED]: false as boolean,
};

const eventPlanServiceSlice = createSlice({
  name: "eventPlanService",
  initialState,
  reducers: {
    setPlanProp: (
      state: EventPlanServiceState,
      action: PayloadAction<{
        name: EV_PLAN_SERVICE_PROP;
        value: string;
      }>
    ) => {
      const payload = action.payload;
      const propKey = payload.name as EV_PLAN_SERVICE_PROP;

      switch (propKey) {
        case EV_PLAN_SERVICE_PROP.TYPE:
          const toNumberValue = Number(payload.value)
          const currentItem = state[propKey].items.find((item) => item.id == toNumberValue);

          if (currentItem) state[propKey].current = currentItem;

          break;

        case EV_PLAN_SERVICE_PROP.NAME:
          state[EV_PLAN_SERVICE_PROP.NAME] = payload.value;
          break;

        case EV_PLAN_SERVICE_PROP.DATE:
          state[EV_PLAN_SERVICE_PROP.DATE] = payload.value;
          state[EV_PLAN_SERVICE_PROP.IS_EXPIRED] = isDifferenceMoreThanFourMonths(payload.value);
          break;
        default:
          break;
      }
    },
    setFinishStatus: (state: EventPlanServiceState, action: PayloadAction) => {
      state[EV_PLAN_SERVICE_PROP.TYPE] = {
        items: servicePlanItem as Array<EventPlanServiceCall>,
        current: servicePlanItem[0] as EventPlanServiceCall,
        isChanged: false as boolean,
      };
      state[EV_PLAN_SERVICE_PROP.NAME] = "";
      state[EV_PLAN_SERVICE_PROP.DATE] = getInitialDate().current as string;
    },

    setIsActive: (state: EventPlanServiceState, action: PayloadAction) => {

      state[EV_PLAN_SERVICE_PROP.IS_ACTIVE] = !state[EV_PLAN_SERVICE_PROP.IS_ACTIVE];
    },
    clean: (
      state: EventPlanServiceState, action: PayloadAction
    ) => {
      const servicePlanItem = createInitialStatePlanItems();
      
      state[EV_PLAN_SERVICE_PROP.TYPE] = {
        items: servicePlanItem as EventPlanServiceCall[],
        current: servicePlanItem[0] as EventPlanServiceCall,
        isChanged: false as boolean,
      } as EV_PLAN_STATE_SERVICE_ITEM

      state[EV_PLAN_SERVICE_PROP.NAME] = "";
      state[EV_PLAN_SERVICE_PROP.DATE] = getInitialDate().current as string;
      state[EV_PLAN_SERVICE_PROP.TIME] = null as string | null;
      state[EV_PLAN_SERVICE_PROP.IS_ACTIVE] = true as boolean;
      state[EV_PLAN_SERVICE_PROP.IS_EXPIRED] = false as boolean;
      
    }

  },
});

export const eventPlanServiceReducer = eventPlanServiceSlice.reducer;

// Экспорт actions
export const eventPlanServiceActions = eventPlanServiceSlice.actions;
