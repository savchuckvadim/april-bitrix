import { EBxMethod } from '../../../core';
import {  IBXActivityConfigurableAddRequest } from '../interfaces/bx-activity-configurable.interface';
// import { CrmListRequestType } from '../crm/type/crm-request.type';
// import {
//     BXActivityRequest,
//     BXActivityRequestFields,
//     IBXActivity,
// } from './interfaces/bx-activity.interface';

export type ActivityConfigurableSchema = {
    // [EBxMethod.GET]: {
    //     request: { id: number | string };
    //     response: IBXTask;
    // };
    // [EBxMethod.LIST]: {
    //     request: CrmListRequestType<BXActivityRequestFields>;
    //     response: IBXActivity[];
    // };
    [EBxMethod.ADD]: {
        request: IBXActivityConfigurableAddRequest;
        response: number;
    };
    // [EBxMethod.UPDATE]: {
    //     request: {
    //         id: number | string;
    //         fields: Partial<IBXActivity>;
    //     };
    //     response: { tasks: IBXActivity[] };
    // };
    // [EBxMethod.DELETE]: {
    //     request: { id: number | string };
    //     response: { tasks: IBXActivity[] };
    // };
};
