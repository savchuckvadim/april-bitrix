import { PBXField, Portal } from "@workspace/pbx";
import {
  EV_BASE_CONTACT_ITEM_PROP,
  EV_CONTACT_ITEM_PROP,
  PBX_FIELD_TYPE,
  PBXContactField,
  PBXContactFieldData,
  PBXContactStateItem,

} from "../type/pbx-contact-type";
import { BXContact } from "@workspace/bx";

export const getPBXContactsSetupData = (
  pFields: PBXField[],
  contact: BXContact
): PBXContactFieldData[] => {
  const stateItems: PBXContactFieldData[] = [];

  for (const pfield of pFields) {
    const isTarget = isContactProp(pfield.code);

    if (isTarget) {
      const currentField = pfield as PBXContactField;
      const fieldBxId = `UF_CRM_${currentField.bitrixId}`;

      if (contact && contact.hasOwnProperty(fieldBxId)) {
        //@ts-ignore
        const currentItemId = contact[fieldBxId];
        let currentItem = currentItemId;

        if (pfield.type == PBX_FIELD_TYPE.ENUM) {
          if (currentItemId) {



          }
          currentItem = currentField.items.find((pfi) => pfi.bitrixId == currentItemId);


        } else if (pfield.type == PBX_FIELD_TYPE.USER) {
          const data = { ID: currentItem };
        }

        const propValue = {
          bitrixId: fieldBxId,
          items: currentField.items,
          current: currentItem || null,
          field: currentField,
        } as PBXContactFieldData;

        // const propName = currentField.code as EV_CONTACT_PROP;

        stateItems.push(propValue);
      }
    }
  }

  const filterUniqueByCode = (items: PBXContactFieldData[]) => {
    const seenCodes = new Set<string>(); // Хранилище для уникальных кодов
    return items.filter((item) => {
      if (seenCodes.has(item.field.code)) {
        return false; // Пропускаем дубликат
      }
      seenCodes.add(item.field.code);
      return true;
    });
  };

  // упорядочивание по enum EV_COMPANY_PROP
  const enumOrder = Object.values(EV_CONTACT_ITEM_PROP);

  // stateItems.sort((f, fi) => fi.field.id - f.field.id);

  // const result = filterUniqueByCode(stateItems);
  // Сортировка stateItems по порядку в EV_CONTACT_PROP
  stateItems.sort((a, b) => enumOrder.indexOf(a.field.code) - enumOrder.indexOf(b.field.code));

  return stateItems;
};

export function isContactProp(value: string): value is EV_CONTACT_ITEM_PROP {
  return Object.values(EV_CONTACT_ITEM_PROP).includes(value as EV_CONTACT_ITEM_PROP);
}


export const getContactsRequestSelect = (): string[] => {
  const select: string[] = [
    ...Object.values(EV_CONTACT_ITEM_PROP).map(key => `UF_CRM_${key.toUpperCase()}`),
    ...Object.values(EV_BASE_CONTACT_ITEM_PROP),
  ];
  return select;
}


export const getPbxContactByContact = (portal: Portal, contact: BXContact): PBXContactStateItem => {
  // TODO(port): new @workspace/pbx Portal has no `contact` field config; wire real source.
  const pbxContact = (portal as any).contact
  const pbxFields = pbxContact?.bitrixfields as PBXField[]
  const fields = getPBXContactsSetupData(pbxFields, contact) as PBXContactFieldData[]
  return {
    ...contact,
    fields,
  } as PBXContactStateItem
}
