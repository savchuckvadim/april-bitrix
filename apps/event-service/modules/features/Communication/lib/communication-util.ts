import {
  EV_COMMUNICATION_STATE_PARTS,
  COMMUNICATION_TYPE,
  COMMUNICATION_INITIATIVE,
  CommunicationItem,
  COMMUNICATION_TYPE_NAME,
  COMMUNICATION_INITIATIVE_NAMES,
} from '../type/communications-type';

export function fillCommunicationItems<
  T extends COMMUNICATION_TYPE | COMMUNICATION_INITIATIVE
>(
  type: EV_COMMUNICATION_STATE_PARTS,
  values: Record<string, string>,
  names: Record<string, COMMUNICATION_TYPE_NAME | COMMUNICATION_INITIATIVE_NAMES>
): CommunicationItem<T>[] {

  return Object.entries(values).map(([key, value], index) => ({
    id: index, // Уникальный идентификатор
    code: value as T,
    name: names[key] as COMMUNICATION_TYPE_NAME | COMMUNICATION_INITIATIVE_NAMES, // Явно указываем тип
  }));
}
