import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { COMMUNICATION_INITIATIVE, COMMUNICATION_INITIATIVE_NAMES, COMMUNICATION_TYPE, COMMUNICATION_TYPE_NAME, CommunicationItem, EV_COMMUNICATION_STATE_PARTS } from "../type/communications-type";
import { fillCommunicationItems } from "../lib/communication-util";
import { CommunicationActionFromPlan, CommunicationInitAction, SetCurrentCommunication } from "../type/action-type";
import { EV_TARGET } from "@/modules/processes/event/types/ev-process-type";

//TYPES
export type EventCommunicationState = typeof initialState;


const initialState = {
  [EV_COMMUNICATION_STATE_PARTS.TYPE]: {
    items: fillCommunicationItems<COMMUNICATION_TYPE>(
      EV_COMMUNICATION_STATE_PARTS.TYPE,
      COMMUNICATION_TYPE,
      COMMUNICATION_TYPE_NAME
    ) as CommunicationItem<COMMUNICATION_TYPE>[],
    current: {
      [EV_TARGET.PLAN]: null as null | undefined | CommunicationItem<COMMUNICATION_TYPE>,
      [EV_TARGET.REPORT]: null as null | undefined | CommunicationItem<COMMUNICATION_TYPE>,
    },

    isFetched: false as boolean,

  },
  [EV_COMMUNICATION_STATE_PARTS.INITIATIVE]: {
    items: fillCommunicationItems<COMMUNICATION_INITIATIVE>(
      EV_COMMUNICATION_STATE_PARTS.INITIATIVE,
      COMMUNICATION_INITIATIVE,
      COMMUNICATION_INITIATIVE_NAMES
    ) as CommunicationItem<COMMUNICATION_INITIATIVE>[],
    current: {
      [EV_TARGET.PLAN]: null as null | undefined | CommunicationItem<COMMUNICATION_INITIATIVE>,
      [EV_TARGET.REPORT]: null as null | undefined | CommunicationItem<COMMUNICATION_INITIATIVE>,
    },

    isFetched: false as boolean,

  },
};

const eventCommunicationSlice = createSlice({
  name: "eventCommunicationSlice",
  initialState,
  reducers: {
    setInit: (
      state: EventCommunicationState,
      action: PayloadAction<CommunicationInitAction>
    ) => {
      const pay = action.payload;

      state[EV_COMMUNICATION_STATE_PARTS.TYPE].current[EV_TARGET.PLAN] = pay[EV_COMMUNICATION_STATE_PARTS.TYPE][EV_TARGET.PLAN]
      state[EV_COMMUNICATION_STATE_PARTS.TYPE].current[EV_TARGET.REPORT] = pay[EV_COMMUNICATION_STATE_PARTS.TYPE][EV_TARGET.REPORT]
      state[EV_COMMUNICATION_STATE_PARTS.TYPE].isFetched = true

      state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].current[EV_TARGET.PLAN] = pay[EV_COMMUNICATION_STATE_PARTS.INITIATIVE][EV_TARGET.PLAN]
      state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].current[EV_TARGET.REPORT] = pay[EV_COMMUNICATION_STATE_PARTS.INITIATIVE][EV_TARGET.REPORT]
      state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].isFetched = true

    },
    setFromPlan: (
      state: EventCommunicationState,
      action: PayloadAction<CommunicationActionFromPlan>
    ) => {
      const pay = action.payload;

      state[EV_COMMUNICATION_STATE_PARTS.TYPE].current[EV_TARGET.PLAN] = pay[EV_COMMUNICATION_STATE_PARTS.TYPE][EV_TARGET.PLAN]
      state[EV_COMMUNICATION_STATE_PARTS.TYPE].isFetched = true

      state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].current[EV_TARGET.PLAN] = pay[EV_COMMUNICATION_STATE_PARTS.INITIATIVE][EV_TARGET.PLAN]
      state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].isFetched = true

    },
    setCurrent: (
      state: EventCommunicationState,
      action: PayloadAction<SetCurrentCommunication>
    ) => {
      const pay = action.payload;
      const result = state[pay.type].items.find((item, index) => {
        let searchedIndex = pay.index + 1
        if (pay.index + 1 >= state[pay.type].items.length) {
          searchedIndex = 0
        }
        return index == searchedIndex
      });

 
      state[pay.type].current[pay.target] = result;
    },

    clean: (
      state: EventCommunicationState,
      action: PayloadAction
    ) => {
      const pay = action.payload;
      state[EV_COMMUNICATION_STATE_PARTS.TYPE].current[EV_TARGET.PLAN] = null
      state[EV_COMMUNICATION_STATE_PARTS.TYPE].current[EV_TARGET.REPORT] = null
      state[EV_COMMUNICATION_STATE_PARTS.TYPE].isFetched = false

      state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].current[EV_TARGET.PLAN] = null
      state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].current[EV_TARGET.REPORT] = null
      state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].isFetched = false
    },

  },
});

//utils

export const eventCommunicationReducer = eventCommunicationSlice.reducer;

// Экспорт actions
export const eventCommunicationActions = eventCommunicationSlice.actions;
