import { EBxMethod } from '../../../../core/domain/consts/bitrix-api.enum';
import {
    CrmGetRequestType,
    CrmAddRequestType,
    CrmUpdateRequestType,
    CrmListRequestType,
} from '../../type/crm-request.type';
import { IBXDeal } from '../interface/bx-deal.interface';
import { IBXField } from '../../fields/bx-field.interface';

export type DealSchema = {
    [EBxMethod.GET]: {
        request: CrmGetRequestType;
        response: IBXDeal;
    };
    [EBxMethod.LIST]: {
        request: CrmListRequestType<IBXDeal>;
        response: IBXDeal[];
    };
    [EBxMethod.ADD]: {
        request: CrmAddRequestType<IBXDeal>;
        response: number;
    };
    [EBxMethod.UPDATE]: {
        request: CrmUpdateRequestType<IBXDeal>;
        response: number;
    };
    [EBxMethod.CONTACT_ITEMS_SET]: {
        request: {
            id: number | string;
            items: { CONTACT_ID: string | number }[];
        };
        response: number;
    };
    /**
     * `crm.deal.contact.add` — добавить ОДИН контакт, не трогая остальных.
     * Повторная привязка не ошибка: result=false «уже связан».
     */
    [EBxMethod.CONTACT_ADD]: {
        request: {
            id: number | string;
            fields: {
                CONTACT_ID: number | string;
                IS_PRIMARY?: 'Y' | 'N';
                SORT?: number;
            };
        };
        response: boolean;
    };
    [EBxMethod.CONTACT_ITEMS_GET]: {
        request: { id: number | string };
        response: {
            CONTACT_ID: number;
            SORT: number;
            ROLE_ID: number;
            IS_PRIMARY: 'Y' | 'N';
        }[];
    };
    [EBxMethod.CONTACT_ITEMS_DELETE]: {
        request: { id: number | string };
        response: number;
    };
    [EBxMethod.USER_FIELD_LIST]: {
        request: { filter: { [key: string]: any }; select?: string[] };
        response: IBXField[];
    };
    [EBxMethod.USER_FIELD_GET]: {
        request: { id: number | string; select?: string[] };
        response: IBXField;
    };
};
