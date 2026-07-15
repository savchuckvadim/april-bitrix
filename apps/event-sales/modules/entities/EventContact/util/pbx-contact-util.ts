import { BXContact } from '@workspace/bx';
import { PBXField, Portal } from '@/modules/app/types/portal/portal-type';
import {
    EV_BASE_CONTACT_ITEM_PROP,
    EV_CONTACT_ITEM_PROP,
    PBX_FIELD_TYPE,
    PBXContactField,
    PBXContactFieldData,
    PBXContactStateItem,
} from '../type/pbx-contact-type';

export const getPBXContactsSetupData = (
    pFields: PBXField[],
    contact: BXContact,
): PBXContactFieldData[] => {
    const stateItems: PBXContactFieldData[] = [];

    for (const pfield of pFields) {
        if (!isContactProp(pfield.code)) continue;

        const currentField = pfield as PBXContactField;
        const fieldBxId = `UF_CRM_${currentField.bitrixId}`;

        if (contact && Object.prototype.hasOwnProperty.call(contact, fieldBxId)) {
            const currentItemId = (contact as unknown as Record<string, unknown>)[fieldBxId];
            let currentItem: PBXContactFieldData['current'] =
                currentItemId as PBXContactFieldData['current'];

            if (pfield.type == PBX_FIELD_TYPE.ENUM) {
                currentItem =
                    currentField.items.find(pfi => pfi.bitrixId == currentItemId) ?? null;
            }

            stateItems.push({
                bitrixId: fieldBxId,
                items: currentField.items,
                current: currentItem || null,
                field: currentField,
            });
        }
    }

    // Порядок полей — по enum EV_CONTACT_ITEM_PROP
    const enumOrder = Object.values(EV_CONTACT_ITEM_PROP);
    stateItems.sort(
        (a, b) => enumOrder.indexOf(a.field.code) - enumOrder.indexOf(b.field.code),
    );

    return stateItems;
};

export function isContactProp(value: string): value is EV_CONTACT_ITEM_PROP {
    return Object.values(EV_CONTACT_ITEM_PROP).includes(value as EV_CONTACT_ITEM_PROP);
}

export const getContactsRequestSelect = (): string[] => [
    ...Object.values(EV_CONTACT_ITEM_PROP).map(key => `UF_CRM_${key.toUpperCase()}`),
    ...Object.values(EV_BASE_CONTACT_ITEM_PROP),
];

export const getPbxContactByContact = (
    portal: Portal,
    contact: BXContact,
): PBXContactStateItem => {
    const pbxFields = portal.contact?.bitrixfields ?? [];
    const fields = getPBXContactsSetupData(pbxFields, contact);
    return {
        ...contact,
        fields,
    } as PBXContactStateItem;
};
