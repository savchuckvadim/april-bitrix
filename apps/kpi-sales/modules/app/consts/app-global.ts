import { BXUser } from '@workspace/bx';

/**
 * PROD (NEXT_PUBLIC_IN_BITRIX=true): приложение обязано жить во фрейме
 * Bitrix — вне фрейма показываем nonauth. DEV: вне фрейма работаем
 * с TESTING_* данными (fallback внутри @workspace/bitrix).
 */
export const IS_PROD = process.env.NEXT_PUBLIC_IN_BITRIX === 'true'
export const KPI_REPORT_BASE_URL = process.env.NEXT_PUBLIC_KPI_SALES_API_URL  || 'https://api.kpi-report-sales.ru/'
// export const TESTING_DOMAIN = 'gsr.bitrix24.ru';
// export const TESTING_DOMAIN = 'gsirk.bitrix24.ru';
// export const TESTING_DOMAIN = 'alfacentr.bitrix24.ru'
export const TESTING_DOMAIN = "april-garant.bitrix24.ru" as string;
// export const TESTING_DOMAIN = 'garantservisvoronezh.bitrix24.ru'
const TESTING_USER_ID = 1 // 2153 // 447 //2153
const LAST_NAME = "Савчук" //Савчук
const EMAIL = "" //savchuk
export const TESTING_USER = {
    ID: TESTING_USER_ID,
    ACTIVE: true,
    DATE_REGISTER: '29/08/1988',
    EMAIL: EMAIL,

    IS_ONLINE: 'string',
    LAST_ACTIVITY_DATE: ['string'],
    LAST_LOGIN: 'string',
    LAST_NAME: LAST_NAME,
    NAME: 'reywhhsdfhs3554ufahfhd',
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
