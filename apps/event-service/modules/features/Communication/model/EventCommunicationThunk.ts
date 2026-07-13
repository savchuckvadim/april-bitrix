import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { EV_SERVICE_PLAN_CODE } from "@/modules/entities/EventPlan/type/event-plan-service-type";
import { EventTask } from "@/modules/entities/EventTask/types/event-task-type";
import { COMMUNICATION_INITIATIVE, COMMUNICATION_TYPE, EV_COMMUNICATION_STATE_PARTS } from "../type/communications-type";
import { CommunicationActionFromPlan, CommunicationInitAction } from "../type/action-type";
import { eventCommunicationActions } from "./EventCommunicationSlice";
import { EV_TARGET } from "@/modules/processes/event/types/ev-process-type";


export const communicationInit = (task: EventTask) => async (dispatch: AppDispatch, getState: AppGetState) => {
    let planCommunicationType = COMMUNICATION_TYPE.CALL
    let planInitiative = COMMUNICATION_INITIATIVE.MANAGER
    let reportCommunicationType = COMMUNICATION_TYPE.CALL
    let reportinitiative = COMMUNICATION_INITIATIVE.MANAGER


    if (task && task.eventType) {

        if (task.initiative && task.communicationType) {
            reportinitiative = task.initiative
            reportCommunicationType = task.communicationType


        } else {
            if (task.eventType === EV_SERVICE_PLAN_CODE.COMMER
            ) {
                reportinitiative = COMMUNICATION_INITIATIVE.CLIENT
            }

            if (
                task.eventType === EV_SERVICE_PLAN_CODE.SS
            ) {
                reportinitiative = COMMUNICATION_INITIATIVE.CLIENT
                reportCommunicationType = COMMUNICATION_TYPE.SS
            }
        }

    }
    const state = getState().eventCommunication
    const initiativeItems = state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].items
    const initiativePlanCurrentItem = initiativeItems.find(item => item.code == planInitiative)
    const initiativeReportCurrentItem = initiativeItems.find(item => item.code == reportinitiative)


    const communicationTypeItems = state[EV_COMMUNICATION_STATE_PARTS.TYPE].items
    const communicationTypePlanCurrentItem = communicationTypeItems.find(item => item.code == planCommunicationType)
    const communicationTypeReportCurrentItem = communicationTypeItems.find(item => item.code == reportCommunicationType)


    const action = {
        [EV_COMMUNICATION_STATE_PARTS.INITIATIVE]: {
            [EV_TARGET.PLAN]: initiativePlanCurrentItem,
            [EV_TARGET.REPORT]: initiativeReportCurrentItem
        },
        [EV_COMMUNICATION_STATE_PARTS.TYPE]: {
            [EV_TARGET.PLAN]: communicationTypePlanCurrentItem,
            [EV_TARGET.REPORT]: communicationTypeReportCurrentItem

        }
    } as CommunicationInitAction


    dispatch(
        eventCommunicationActions
            .setInit(action)
    )
}

export const communicationChangrFromPlanType = (planEventType: EV_SERVICE_PLAN_CODE) => async (dispatch: AppDispatch, getState: AppGetState) => {
    let planCommunicationType = COMMUNICATION_TYPE.CALL
    let planInitiative = COMMUNICATION_INITIATIVE.MANAGER
    // let reportCommunicationType = COMMUNICATION_TYPE.CALL
    // let reportinitiative = COMMUNICATION_INITIATIVE.MANAGER


    if (planEventType) {

        if (planEventType === EV_SERVICE_PLAN_CODE.COMMER
        ) {
            planInitiative = COMMUNICATION_INITIATIVE.CLIENT
        }

        if (
            planEventType === EV_SERVICE_PLAN_CODE.SS
        ) {
            planInitiative = COMMUNICATION_INITIATIVE.CLIENT
            planCommunicationType = COMMUNICATION_TYPE.SS
        }
    }
    const state = getState().eventCommunication
    const initiativeItems = state[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].items
    const initiativePlanCurrentItem = initiativeItems.find(item => item.code == planInitiative)
    // const initiativeReportCurrentItem = initiativeItems.find(item => item.code == reportinitiative)


    const communicationTypeItems = state[EV_COMMUNICATION_STATE_PARTS.TYPE].items
    const communicationTypePlanCurrentItem = communicationTypeItems.find(item => item.code == planCommunicationType)
    // const communicationTypeReportCurrentItem = communicationTypeItems.find(item => item.code == reportCommunicationType)


    const action = {
        [EV_COMMUNICATION_STATE_PARTS.INITIATIVE]: {
            [EV_TARGET.PLAN]: initiativePlanCurrentItem,
            // [EV_TARGET.REPORT]: initiativeReportCurrentItem
        },
        [EV_COMMUNICATION_STATE_PARTS.TYPE]: {
            [EV_TARGET.PLAN]: communicationTypePlanCurrentItem,
            // [EV_TARGET.REPORT]: communicationTypeReportCurrentItem

        }
    } as CommunicationActionFromPlan


    dispatch(
        eventCommunicationActions
            .setFromPlan(action)
    )
}