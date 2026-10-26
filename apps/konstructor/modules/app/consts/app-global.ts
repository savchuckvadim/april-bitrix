import { IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import { Placement } from '@workspace/bx';

/**
 * true = сборка для фрейма Bitrix (NEXT_PUBLIC_IN_BITRIX инлайнится на билде).
 * В dev держим false в .env — иначе вне фрейма показывается NonAuthScreen.
 */
export const IS_PROD = process.env.NEXT_PUBLIC_IN_BITRIX === 'true';

/**
 * Dev вне фрейма Bitrix: портал, сделка и пользователь — ТОЛЬКО из env
 * (`NEXT_PUBLIC_DEV_*` в apps/konstructor/.env) и только тестовые. Реальные
 * порталы в коде не живут: dev-сборка против настоящей сделки пишет в неё
 * слепки и документы. В прод-сборке значения всегда пустые.
 */
const devEnv = (value: string | undefined): string =>
    IS_PROD ? '' : (value ?? '').trim();

export const TESTING_DOMAIN = devEnv(process.env.NEXT_PUBLIC_DEV_DOMAIN);
export const TESTING_DEAL_ID = Number(devEnv(process.env.NEXT_PUBLIC_DEV_DEAL_ID)) || 0;
export const TESTING_COMPANY_ID = Number(devEnv(process.env.NEXT_PUBLIC_DEV_COMPANY_ID)) || 0;
export const DEV_CURRENT_USER_ID = Number(devEnv(process.env.NEXT_PUBLIC_DEV_USER_ID)) || 1;

/** Dev-режим настроен: есть тестовый портал и сделка */
export const HAS_DEV_PLACEMENT = Boolean(TESTING_DOMAIN && TESTING_DEAL_ID);

export const DEV_PLACEMENT_HINT =
    'Dev-режим вне фрейма Bitrix: задайте NEXT_PUBLIC_DEV_DOMAIN и NEXT_PUBLIC_DEV_DEAL_ID ' +
    'в apps/konstructor/.env — только тестовый портал и тестовая сделка.';

export const TESTING_USER = {
    ID: DEV_CURRENT_USER_ID,
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
