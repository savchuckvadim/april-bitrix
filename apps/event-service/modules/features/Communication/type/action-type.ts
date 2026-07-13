import { EV_TARGET } from "@/modules/processes/event/types/ev-process-type";
import { COMMUNICATION_INITIATIVE, COMMUNICATION_TYPE, CommunicationItem, EV_COMMUNICATION_STATE_PARTS } from "./communications-type";

export interface CommunicationInitAction {
    [EV_COMMUNICATION_STATE_PARTS.TYPE]: {
        [EV_TARGET.PLAN]: CommunicationItem<COMMUNICATION_TYPE>,
        [EV_TARGET.REPORT]: CommunicationItem<COMMUNICATION_TYPE>,
    },
    [EV_COMMUNICATION_STATE_PARTS.INITIATIVE]: {
        [EV_TARGET.PLAN]: CommunicationItem<COMMUNICATION_INITIATIVE>,
        [EV_TARGET.REPORT]: CommunicationItem<COMMUNICATION_INITIATIVE>,
    },
}

export interface CommunicationActionFromPlan {
    [EV_COMMUNICATION_STATE_PARTS.TYPE]: {
        [EV_TARGET.PLAN]: CommunicationItem<COMMUNICATION_TYPE>,
    },
    [EV_COMMUNICATION_STATE_PARTS.INITIATIVE]: {
        [EV_TARGET.PLAN]: CommunicationItem<COMMUNICATION_INITIATIVE>,
    },
}

export interface SetCurrentCommunication {
    type: EV_COMMUNICATION_STATE_PARTS;
    target: EV_TARGET;
    index: number;
  }