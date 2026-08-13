import { BXContact } from '@workspace/bx';
import { ufKey } from '@workspace/pbx';
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
        const fieldBxId = ufKey(currentField);

        if (
            contact &&
            Object.prototype.hasOwnProperty.call(contact, fieldBxId)
        ) {
            const currentItemId = (
                contact as unknown as Record<string, unknown>
            )[fieldBxId];
            let currentItem: PBXContactFieldData['current'] =
                currentItemId as PBXContactFieldData['current'];

            if (pfield.type == PBX_FIELD_TYPE.ENUM) {
                currentItem =
                    currentField.items.find(
                        pfi => pfi.bitrixId == currentItemId,
                    ) ?? null;
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
        (a, b) =>
            enumOrder.indexOf(a.field.code) - enumOrder.indexOf(b.field.code),
    );

    return stateItems;
};

export function isContactProp(value: string): value is EV_CONTACT_ITEM_PROP {
    return Object.values(EV_CONTACT_ITEM_PROP).includes(
        value as EV_CONTACT_ITEM_PROP,
    );
}

/**
 * Что просить у crm.contact.list: базовые поля плюс ключи характеристик.
 *
 * Ключи берём ИЗ СЛЕПКА портала (доктрина «код → Portal → bitrixId»), а не
 * из кода поля в верхнем регистре. Раньше было именно так — и на портале, где
 * bitrixId отличается от кода, характеристика молча не приезжала: значение
 * стояло, а приложение показывало «не задано» и «не запоминало» правки.
 *
 * Слепка нет — остаётся прежнее допущение (код = bitrixId): без него список
 * контактов не собрать вовсе.
 */
export const getContactsRequestSelect = (portal?: Portal | null): string[] => {
    const fields = portal?.contact?.bitrixfields ?? [];

    const traitKeys = Object.values(EV_CONTACT_ITEM_PROP).map(code => {
        const field = fields.find(item => item.code === code);
        return field ? ufKey(field) : `UF_CRM_${code.toUpperCase()}`;
    });

    return [...traitKeys, ...Object.values(EV_BASE_CONTACT_ITEM_PROP)];
};

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
