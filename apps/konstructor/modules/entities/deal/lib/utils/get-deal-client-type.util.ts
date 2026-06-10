import { RQ_TYPE } from '@workspace/bx-rq';
import { IBXDeal } from '@bitrix/index';
import {
    PBXDeal,
    PBXField,
    PBXFieldItem,
} from '@/modules/entities/portal/type/portal.type';

/** Code of the pbx "Тип Клиента" field (see PBX_SALES_EVENT_FIELDS). */
export const CLIENT_TYPE_FIELD_CODE = 'op_client_type';

/**
 * Maps an `op_client_type` enum item code to an RQ type.
 * Item codes: state=Бюджетники, commerc=Коммерческие, ip=ИП, fiz=Физ лицо,
 * layer=Адвокаты. TODO: confirm `layer` (Адвокаты) — assumed FIZ.
 */
const ITEM_CODE_TO_RQ_TYPE: Record<string, RQ_TYPE> = {
    state: RQ_TYPE.BUDGET,
    commerc: RQ_TYPE.ORGANIZATION,
    ip: RQ_TYPE.IP,
    fiz: RQ_TYPE.FIZ,
    layer: RQ_TYPE.FIZ,
};

const findClientTypeField = (portalDeal?: PBXDeal): PBXField | undefined =>
    portalDeal?.bitrixfields?.find(
        field => field.code === CLIENT_TYPE_FIELD_CODE,
    );

/**
 * Resolve the deal's client type from the portal pbx model + the bitrix deal:
 *  1. find the `op_client_type` field in the portal's installed deal fields;
 *  2. read its value off the deal — `deal[field.bitrixId]` is the selected
 *     item's (portal-specific) bitrixId, e.g. `deal["UF_CRM_879989889"] = 1345`;
 *  3. match that bitrixId against `field.items` to get the chosen item;
 *  4. map the item's stable `code` to an RQ type.
 */
export const getDealClientType = (
    portalDeal?: PBXDeal,
    deal?: IBXDeal,
): RQ_TYPE | null => {
    const field = findClientTypeField(portalDeal);
    if (!field || !deal) {
        return null;
    }

    const selectedBitrixId = deal[field.bitrixId];
    if (selectedBitrixId === undefined || selectedBitrixId === null) {
        return null;
    }

    const selectedItem = field.items?.find(
        item => Number(item.bitrixId) === Number(selectedBitrixId),
    );
    if (!selectedItem) {
        return null;
    }

    return ITEM_CODE_TO_RQ_TYPE[selectedItem.code] ?? null;
};

/**
 * Inverse lookup: the bitrixId to write into the deal's `op_client_type` field
 * for a given RQ type (so the value can be changed). Null if absent on the portal.
 */
export const getDealClientTypeBitrixIdByRType = (
    portalDeal: PBXDeal | undefined,
    type: RQ_TYPE,
): number | null => {
    const field = findClientTypeField(portalDeal);
    const item = field?.items?.find(
        listItem => ITEM_CODE_TO_RQ_TYPE[listItem.code] === type,
    );
    return item ? Number(item.bitrixId) : null;
};

export const getCurrentListItemByValue = (
    list: PBXFieldItem[],
    value: string,
) => {
    return list.find(item => item.name === value);
};

export const getCurrentListItemValueByBitrixId = (
    list: PBXFieldItem[],
    value: string | number,
) => {
    return list.find(item => Number(item.bitrixId) === Number(value))?.name;
};
