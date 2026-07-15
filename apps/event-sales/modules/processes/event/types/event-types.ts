/** Экранные состояния флоу событий; сами роуты — нативные Next-страницы. */
export enum ROUTE_EVENT {
    LIST = 'list',
    ITEM = 'item',
    FINISH = 'finish',
}

/**
 * Коды полей, участвующих в валидации отправки (send()).
 * ВАЖНО: строковые значения должны совпадать с prop-enum'ами сущностей
 * (EV_REPORT_PROP.COMMENT = 'comment', EV_PLAN_PROP.NAME = 'name', …),
 * которые появятся в Фазе 4 — тогда сущности переиспользуют эти ключи.
 */
export enum EV_ERROR_CODE {
    COMMENT = 'comment',
    PLAN_NAME = 'name',
    PLAN_TYPE = 'type',
    POST_FAIL_DATE = 'postFailDate',
    CONTACT_NAME = 'contactName',
    CONTACT_PHONE = 'contactPhone',
    CONTACT_EMAIL = 'contactEmail',
    CONTACT_POST = 'contactPost',
}

export type EventCurrentErrors = Record<EV_ERROR_CODE, string>;

export interface SetErrorsPayload {
    isError: boolean;
    errors: EventCurrentErrors;
}

export interface SetFullCompleteStatusPayload {
    status: boolean;
}

export interface SetFinishStatusPayload {
    status: boolean;
    result: 'Звонок запланирован' | 'Презентация запланирована' | '';
}
