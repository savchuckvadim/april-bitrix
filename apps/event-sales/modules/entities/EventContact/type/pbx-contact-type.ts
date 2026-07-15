import { BXContact } from '@workspace/bx';
import { PBXField, PBXFieldItem } from '@/modules/app/types/portal/portal-type';

// Bitrix userfield type discriminator (was PBX_FIELD_TYPE in legacy @packages/pbx).
export enum PBX_FIELD_TYPE {
    ENUM = 'enumeration',
    SELECT = 'select',
    USER = 'employee',
    STRING = 'string',
}

export interface PBXContactField extends PBXField {
    code: EV_CONTACT_ITEM_PROP;
}

export enum EV_CONTACT_ITEM_PROP {
    ork_is_lpr = 'ork_is_lpr',
    contact_client_status = 'contact_client_status',
    ork_is_most_user = 'ork_is_most_user',
    op_client_status = 'op_client_status',
    ork_contact_garant = 'ork_contact_garant',
    ork_contact_concurent = 'ork_contact_concurent',
    ork_needs = 'ork_needs',
    ork_call_frequency = 'ork_call_frequency',
    ork_chk_garant = 'ork_chk_garant',
}

export enum EV_BASE_CONTACT_ITEM_PROP {
    ID = 'ID',
    NAME = 'NAME',
    LAST_NAME = 'LAST_NAME',
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    COMMENTS = 'COMMENTS',
    POST = 'POST',
}

export interface PBXItem {
    bitrixId: string;
    field: PBXField;
    items: PBXFieldItem[];
    current: PBXFieldItem | null | string | number;
}

export interface PBXContactFieldData extends PBXItem {
    field: PBXContactField;
}

export interface PBXContactStateItem extends BXContact {
    fields: PBXContactFieldData[];
    [key: string]: any;
}
