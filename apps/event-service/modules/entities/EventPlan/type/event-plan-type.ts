export enum EV_PLAN_CODE {
    COLD = 'cold',
    WARM = 'warm',
    PRESENTATION = 'presentation',
    HOT = 'hot',
    PAY = 'moneyAwait'
}
export type EventPlanCall = {
    id: number,
    code: EV_PLAN_CODE,
    name: string
}
export enum EV_PLAN_PROP {
    NAME = 'name',
    // DESCRIPTION = 'description',
    // RESPONSIBILITY = 'responsibility',
    // CREATED_BY = 'createdBy',
    DATE = 'date',
    TIME = 'time',
    TYPE = 'type',
    STATUS = 'status',
    IS_EXPIRED = 'isExpired',
    // CRM = 'crm',
    // PLAN = 'plan',
    // COMPANY = 'company',
    // LEAD = 'lead',
    // SMART = 'smart',
    // SALE = 'sale',
    // PRESENTATION = 'presentation',
    // IS_ONE_MORE = 'isOneMore',
    IS_ACTIVE = 'isActive',
    // CONTACT_NAME = 'contactName',
    // CONTACT_EMAIL = 'contactEmail',
    // CONTACT_PHONE = 'contactPhone',

    // IS_UNPLANNED_PRESENTATION = 'isUnplannedPresentation'
}

