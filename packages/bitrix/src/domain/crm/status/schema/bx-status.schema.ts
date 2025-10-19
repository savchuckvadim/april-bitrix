import { EBxMethod } from '../../../../core';
import { IBXStatus } from '../interface/bx-status.interface';
import { CrmListRequestType } from '../../type/crm-request.type';

export type BxStatusSchema = {
    [EBxMethod.LIST]: {
        request: CrmListRequestType<IBXStatus>;
        response: IBXStatus[];
    };
};
