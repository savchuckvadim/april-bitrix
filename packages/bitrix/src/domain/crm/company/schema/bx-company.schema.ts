import { EBxMethod } from '../../../../core';
import { IBXField } from '../../fields/bx-field.interface';
import {
    CrmGetRequestType,
    CrmAddRequestType,
    CrmUpdateRequestType,
    CrmListRequestType,
} from '../../type/crm-request.type';
import { IBXCompany } from '../interface/bx-company.interface';

export type CompanySchema = {
    [EBxMethod.GET]: {
        request: CrmGetRequestType; // Contains ID and select?
        response: IBXCompany;
    };
    [EBxMethod.LIST]: {
        request: CrmListRequestType<IBXCompany>;
        response: IBXCompany[];
    };
    [EBxMethod.ADD]: {
        request: CrmAddRequestType<IBXCompany>;
        response: number; // ID of created company
    };
    [EBxMethod.UPDATE]: {
        request: CrmUpdateRequestType<IBXCompany>; // Contains id (lowercase) and fields
        response: number; // Bitrix often returns a boolean success as number or specific status, matching DealSchema
    };
    [EBxMethod.USER_FIELD_LIST]: {
        request: { filter: { [key: string]: any }; select?: string[] };
        response: IBXField[];
    };
    [EBxMethod.USER_FIELD_GET]: {
        request: { id: number | string; select?: string[] };
        response: IBXField;
    };
    [EBxMethod.USER_FIELD_ADD]: {
        request: { fields: Partial<IBXField> };
        response: IBXField;
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
    [EBxMethod.CONTACT_ITEMS_SET]: {
        request: {
            id: number | string;
            items: { CONTACT_ID: string | number }[];
        };
        response: number;
    };
    [EBxMethod.CONTACT_ITEMS_DELETE]: {
        request: { id: number | string };
        response: number;
    };
};
