// export const TESTING_DOMAIN = 'gsirk.bitrix24.ru'
// export const TESTING_DOMAIN = 'alfacentr.bitrix24.ru'

import { IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import { Placement } from '@workspace/bx';
// export const TESTING_DOMAIN = 'gsr.bitrix24.ru'
export const TESTING_DOMAIN = 'garantservisvoronezh.bitrix24.ru' as string;
const TESTING_PLACEMENT_LEAD_ID = 318051
const TESTING_PLACEMENT_COMPANY_ID = 158479
const TESTING_PLACEMENT_DEAL_ID = 158479
const TESTING_USER_ID = 447 // 447
const TESTING_USER_NAME = 'Татьяна' //Савчук
const TESTING_USER_LAST_NAME = 'Попова' //Савчук
export const TESTING_USER = {
    ID: TESTING_USER_ID,
    ACTIVE: true,
    DATE_REGISTER: '29/08/1988',
    EMAIL: 'string',

    IS_ONLINE: 'string',
    LAST_ACTIVITY_DATE: 'string',
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
} as IBXUser;

// export const TESTING_PLACEMENT_TYPE = 'CRM_COMPANY_DETAIL_TAB' as const;
export const TESTING_PLACEMENT_TYPE = 'CRM_LEAD_DETAIL_TAB' as const;

export const TESTING_PLACEMENT = {
    placement: TESTING_PLACEMENT_TYPE,
    options: {
        ID: TESTING_PLACEMENT_LEAD_ID,
    },
} as Placement;
