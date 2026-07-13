import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { EV_PLAN_SERVICE_PROP, EV_SERVICE_PLAN_CODE } from "../type/event-plan-service-type";
import { eventPlanServiceActions } from "./EventPlanServiceSlice";
import { communicationChangrFromPlanType } from "@/modules/features/Communication/model/EventCommunicationThunk";

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
    //   const state = getState();
    //   const workStatus = state.eventReport.report[EV_REPORT_PROP.WORK_STATUS]
    //     .current as EventReportSelectItem;
    //   const date = state.eventPlan[EV_PLAN_SERVICE_PROP.DATE];
    //   if (workStatus) {
    //     const isExpired = isDifferenceMoreThanFourMonths(date);

    //     if (workStatus.code === "inJob" && isExpired) {
    //       dispatch(
    //         eventReportActions.setReportProp({
    //           propName: EV_REPORT_PROP.WORK_STATUS,
    //           value: "setAside",
    //         })
    //       );
    //     } else if (workStatus.code === "setAside" && !isExpired) {
    //       dispatch(
    //         eventReportActions.setReportProp({
    //           propName: EV_REPORT_PROP.WORK_STATUS,
    //           value: "inJob",
    //         })
    //       );
    //     }
    //   }
  };


export const changePlanEventType =
  (type: EV_PLAN_SERVICE_PROP, value: string) => (dispatch: AppDispatch, getState: AppGetState) => {

    dispatch(
      eventPlanServiceActions.setPlanProp({
        name: type,
        value: value,
      })
    );

    if (type === EV_PLAN_SERVICE_PROP.TYPE) {
      const state = getState().eventPlanService
      const toNumberValue = Number(value)
      const currentItem = state[type].items.find((item) => item.id == toNumberValue);
      if (currentItem) {
        if (currentItem.code) {
          dispatch(communicationChangrFromPlanType(
            currentItem.code
          ))

        }
      }

    }
  }