import { format } from "date-fns";
import { EV_PLAN_CODE, EV_PLAN_PROP, EventPlanCall } from "../type/event-plan-type";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import {
  EV_REPORT_PROP,
  EventReportSelectItem,
} from "@/modules/entities/EventReport/type/event-report-type";
import { eventReportActions } from "@/modules/entities/EventReport";

//TYPES
export type EventPlanState = typeof initialState;

const getInitialDate = () => {
  // Текущая дата
  const currentDate = new Date();

  // Устанавливаем день месяца в 1, чтобы получить первый день текущего месяца
  const firstDayOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Форматируем обе даты
  const first = format(firstDayOfMonthDate, "yyyy-MM-dd") as string;
  const current = format(currentDate, "yyyy-MM-dd HH:mm") as string;
  return {
    first,
    current,
  };
};

const planCallTypes = [
  {
    id: 1 as number,
    code: EV_PLAN_CODE.WARM,
    name: "Звонок",
  } as EventPlanCall,
  {
    id: 2 as number,
    code: EV_PLAN_CODE.PRESENTATION,
    name: "Презентация",
  } as EventPlanCall,
  {
    id: 3 as number,
    code: EV_PLAN_CODE.HOT,
    name: "Решение",
  } as EventPlanCall,
  {
    id: 4 as number,
    code: EV_PLAN_CODE.PAY,
    name: "Оплата",
  } as EventPlanCall,
];

export type EV_PLAN_STATE_ITEM = {
  items: Array<EventPlanCall>;
  current: EventPlanCall;
  isChanged: boolean;
};
export const initialState = {
  // [EV_PLAN_PROP.RESPONSIBILITY]: {
  //     items: [],
  //     current: null
  // },
  // [EV_PLAN_PROP.CREATED_BY]: {
  //     items: [],
  //     current: null
  // },
  [EV_PLAN_PROP.TYPE]: {
    items: planCallTypes as Array<EventPlanCall>,
    current: planCallTypes[0] as EventPlanCall,
    isChanged: false as boolean,
  } as EV_PLAN_STATE_ITEM,
  [EV_PLAN_PROP.NAME]: "",
  // [EV_PLAN_PROP.DESCRIPTION]: '',
  [EV_PLAN_PROP.DATE]: getInitialDate().current as string,
  [EV_PLAN_PROP.TIME]: null as string | null,
  [EV_PLAN_PROP.IS_ACTIVE]: false as boolean,
  [EV_PLAN_PROP.IS_EXPIRED]: false as boolean,
};

const eventPlanSlice = createSlice({
  name: "eventPlan",
  initialState,
  reducers: {
    setPlanProp: (
      state: EventPlanState,
      action: PayloadAction<{
        name: EV_PLAN_PROP;
        value: string;
      }>
    ) => {
      const payload = action.payload;
      const propKey = payload.name as EV_PLAN_PROP;
      ;
      switch (propKey) {
        case EV_PLAN_PROP.TYPE:
          const currentItem = state[propKey].items.find((item) => item.id.toFixed(0) == payload.value);
          state[propKey].items.forEach((item) => {
            const value = payload.value
            const itemvalue = item.code


          });
          if (currentItem) state[propKey].current = currentItem;
          ;
          break;

        case EV_PLAN_PROP.NAME:
          state[EV_PLAN_PROP.NAME] = payload.value;
          break;

        case EV_PLAN_PROP.DATE:
          state[EV_PLAN_PROP.DATE] = payload.value;
          state[EV_PLAN_PROP.IS_EXPIRED] = isDifferenceMoreThanFourMonths(payload.value);
          break;

        // case EV_PLAN_PROP.CONTACT_NAME:
        //     state[EV_PLAN_PROP.CONTACT_NAME] = payload.value;
        //     break;
        // case EV_PLAN_PROP.CONTACT_PHONE:
        //     state[EV_PLAN_PROP.CONTACT_PHONE] = payload.value;
        //     break;
        // case EV_PLAN_PROP.CONTACT_EMAIL:
        //     state[EV_PLAN_PROP.CONTACT_EMAIL] = payload.value;
        //     break;
        default:
          break;
      }
    },
    setFinishStatus: (state: EventPlanState, action: PayloadAction) => {
      state[EV_PLAN_PROP.TYPE] = {
        items: planCallTypes as Array<EventPlanCall>,
        current: planCallTypes[0] as EventPlanCall,
        isChanged: false as boolean,
      };
      state[EV_PLAN_PROP.NAME] = "";
      state[EV_PLAN_PROP.DATE] = getInitialDate().current as string;
    },
  },
});

export const eventPlanReducer = eventPlanSlice.reducer;

// Экспорт actions
export const eventPlanActions = eventPlanSlice.actions;

export function isDifferenceMoreThanFourMonths(inputDate: string): boolean {
  // Парсим переданную дату, если она строка
  const dateFromInput = new Date(inputDate);
  const currentDate = new Date();

  // Вычисляем разницу в месяцах
  const monthsDifference =
    (currentDate.getFullYear() - dateFromInput.getFullYear()) * 12 +
    currentDate.getMonth() -
    dateFromInput.getMonth();

  // Сравниваем разницу
  return Math.abs(monthsDifference) > 4;
}

export const changeWorkStatusFromDeadline =
  () => (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const workStatus = state.eventReport.report[EV_REPORT_PROP.WORK_STATUS]
      .current as EventReportSelectItem;
    const date = state.eventPlan[EV_PLAN_PROP.DATE];
    if (workStatus) {
      const isExpired = isDifferenceMoreThanFourMonths(date);

      if (workStatus.code === "inJob" && isExpired) {
        dispatch(
          eventReportActions.setReportProp({
            propName: EV_REPORT_PROP.WORK_STATUS,
            value: "setAside",
          })
        );
      } else if (workStatus.code === "setAside" && !isExpired) {
        dispatch(
          eventReportActions.setReportProp({
            propName: EV_REPORT_PROP.WORK_STATUS,
            value: "inJob",
          })
        );
      }
    }
  };
