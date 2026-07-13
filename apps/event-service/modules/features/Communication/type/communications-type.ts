
export enum EV_COMMUNICATION_STATE_PARTS {
  TYPE = "type",
  INITIATIVE = "initiative",
}
export enum COMMUNICATION_TYPE_NAME {

  FACE = 'Выезд',
  EDO = "ЭДО",
  EMAIL = "Электронная почта",
  SS = "Сервисный сигнал",
  CALL = "Телефон",
}

export enum COMMUNICATION_TYPE {

  FACE = 'face',
  EDO = 'edo',
  EMAIL = "mail",
  SS = "signal",
  CALL = "call",

}


export enum COMMUNICATION_INITIATIVE {
  CLIENT = "incoming",
  MANAGER = "outgoing",
}
export enum COMMUNICATION_INITIATIVE_NAMES {
  CLIENT = "входящий",
  MANAGER = "исходящий",
}
type CommunicationTypeOrInitiative = COMMUNICATION_TYPE | COMMUNICATION_INITIATIVE;
export interface CommunicationItem<T extends CommunicationTypeOrInitiative> {
  id: number;
  code: T;
  name: COMMUNICATION_TYPE_NAME | COMMUNICATION_INITIATIVE_NAMES;

}