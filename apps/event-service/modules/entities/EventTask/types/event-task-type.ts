import { EV_SERVICE_PLAN_CODE } from "@/modules/entities/EventPlan/type/event-plan-service-type";
import { PresentationStateCount } from "@/modules/entities/EventPresentation/model/PresSlice";
import { COMMUNICATION_INITIATIVE, COMMUNICATION_TYPE } from "@/modules/features/Communication/type/communications-type";
import type { BXDeal, BXTask, Placement } from "@workspace/bx";

export interface EventTask extends BXTask {
  name: string;
  type: EV_TYPE;
  isExpired: "no" | "almost" | "yes";
  eventType: EV_SERVICE_PLAN_CODE //"xo" | "warm" | "presentation" | "in_progress" | "money_await" | "event";
  presentation: null | PresentationStateCount;
  dealBase: null | BXDeal;
  initiative?: COMMUNICATION_INITIATIVE;
  communicationType?: COMMUNICATION_TYPE;
}

export enum EV_TYPE {
  XO = "Холодный",
  WARM = "Звонок",
  PRES = "Презентация",
  HOT = "Решение",
  MONEY = "Оплата",


  INFO = 'Информация',
  INFO_GARANT = 'Информационный звонок Гарант',
  COMMER = 'Ответ на обращение',
  LEARNING_FIRST = 'Обучение Первичное',
  LEARNING = 'Обучение',
  SS = 'Сервисный сигнал',
  DOCUMENTS = 'Документы',
  PERE_LONG = 'Общение по продлению',
  DEBIT = 'Дебиторка',
  FAIL = 'Обработка угрозы отказа',

}

export interface TasksFetchData {
  domain: string;
  userId: number;
  placement: Placement;
}
