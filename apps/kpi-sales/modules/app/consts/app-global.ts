//
// export const TESTING_DOMAIN = 'alfacentr.bitrix24.ru'

import { BXUser, Placement } from '@workspace/bx';
export const TESTING_DOMAIN = 'gsirk.bitrix24.ru';
// export const TESTING_DOMAIN = 'gsr.bitrix24.ru'
// export const TESTING_DOMAIN = "april-garant.bitrix24.ru" as string;
export const TESTING_USER = {
    ID: 5,
    ACTIVE: true,
    DATE_REGISTER: '29/08/1988',
    EMAIL: 'string',

    IS_ONLINE: 'string',
    LAST_ACTIVITY_DATE: ['string'],
    LAST_LOGIN: 'string',
    LAST_NAME: '',
    NAME: 'MARINA',
    PERSONAL_BIRTHDAY: 'string',
    PERSONAL_CITY: 'string',
    PERSONAL_GENDER: 'string',
    PERSONAL_MOBILE: 'string',
    PERSONAL_PHOTO: 'string',
    PERSONAL_WWW: 'string',
    SECOND_NAME: 'string',
    TIMESTAMP_X: ['1'],
    TIME_ZONE_OFFSET: 'string',
    UF_DEPARTMENT: [1],
    UF_EMPLOYMENT_DATE: 'string',
    UF_PHONE_INNER: 'string',
    // UF_USR_1570437798556: boolean
    USER_TYPE: 'string',
    WORK_PHONE: 'string',
    WORK_POSITION: 'Оператор ТМЦ',
} as BXUser;

export const IS_REMEMBER_DEV = true;
export const TESTING_DEAL_ID = 0; //11311
export const TESTING_COMPANY_ID = 158587 as number; // 158479
export const DEV_CURRENT_USER_ID = 1;
// 11822
// 11822
// export const TESTING_DEAL_ID = 11388
// 10500 month
// 10536 abon + month
// 10550 1abon
// 11726 lic q-2
//DEAL
export const TESTING_PLACEMENT = {
    placement: 'CRM_COMPANY_DETAIL_TAB',
    options: {
        ID: TESTING_COMPANY_ID,
    },
} as Placement;

// export const TESTING_PLACEMENT = {
//     placement: 'CRM_DEAL_DETAIL_TAB',
//     options: {
//         ID: TESTING_DEAL_ID
//     }
// } as Placement

// export const TESTING_PLACEMENT = {
//     placement: 'TASK_VIEW_TOP_PANEL', //TASK_VIEW_SIDEBAR',
//     options: {
//         taskId: 5605
//     }
// } as Placement

// export const TESTING_PLACEMENT = {
//         placement: 'CALL_CARD',
//         options: {
//             CRM_ENTITY_TYPE: 'COMPANY',
//             CRM_ENTITY_ID: TESTING_COMPANY_ID,
//             CALL_DIRECTION:"outgoing",
//             CALL_ID:"C24F78184C4BF39C.1716028715.2918176",
//             CALL_LIST_MODE:"false",
//             CALL_STATE: "connecting",
//             CRM_ACTIVITY_ID: "",
//             CRM_BINDINGS: [
//                 {
//                     ENTITY_ID: TESTING_COMPANY_ID,
//                     ENTITY_TYPE: 'COMPANY'
//                 }
//             ]
//         }
//     } as PlacementCallCard
// 'april-garant.bitrix24.ru' deal for testing 331
// 'alfacentr.bitrix24.ru' deal for testing 1384

// export const IS_DEAL_API_TESTING = false

// ///DOCUMENTS
// export const IS_DOCUMENT_TESTING = false
// export const WITH_DOCUMENT = true

// export const IS_DEV_SERVER = false
// export const TESTING_TEMPLATE_ID = 13

// //REPORT
// export const IS_REPORT = false
// //
