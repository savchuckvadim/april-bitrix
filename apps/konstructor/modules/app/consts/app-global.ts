import { IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import { Placement } from '@workspace/bx';

/**
 * true = сборка для фрейма Bitrix (NEXT_PUBLIC_IN_BITRIX инлайнится на билде).
 * В dev держим false в .env — иначе вне фрейма показывается NonAuthScreen.
 */
export const IS_PROD = process.env.NEXT_PUBLIC_IN_BITRIX === 'true';

/**
 * Тестовая сделка с реальным слепком v1 в bx_document_deals
 * (та же запись, что фикстура entities/snapshot/lib/__fixtures__/legacy-deal.v1.json).
 */
export const TESTING_DOMAIN = 'gsr.bitrix24.ru' as string;
// export const TESTING_DOMAIN = 'april-garant.bitrix24.ru' // deal 32990, company 32442

export const TESTING_DEAL_ID = 129487;
export const TESTING_COMPANY_ID = 105453 as number;
export const DEV_CURRENT_USER_ID = 1;

/** Dev-режим вспоминания: на старте тянуть слепок TESTING_DEAL_ID (см. snapshot-listener). */
export const IS_REMEMBER_DEV = true;

export const TESTING_USER = {
    ID: 1,
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
    USER_TYPE: 'string',
    WORK_PHONE: 'string',
    WORK_POSITION: 'Оператор ТМЦ',
} as IBXUser;

export const TESTING_PLACEMENT = {
    placement: 'CRM_DEAL_DETAIL_TAB',
    options: {
        ID: TESTING_DEAL_ID,
    },
} as Placement;

// COMPANY-вариант (восстановление сделки по компании отложено — см. docs):
// export const TESTING_PLACEMENT = {
//     placement: 'CRM_COMPANY_DETAIL_TAB',
//     options: { ID: TESTING_COMPANY_ID },
// } as Placement;
