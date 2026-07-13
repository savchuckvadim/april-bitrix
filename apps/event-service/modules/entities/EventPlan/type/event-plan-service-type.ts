
export enum EV_SERVICE_PLAN_CODE {
    INFO = 'info',
    INFO_GARANT = 'info_garant',
    COMMER = 'commer', 
    PRESENTATION = 'presentation',
    LEARNING_FIRST = 'edu_first',
    LEARNING = 'edu',
    SS = 'signal', 
    DOCUMENTS = 'call_doc',
    PERE_LONG = 'pere_long',
    DEBIT = 'call_collect',
    FAIL = 'fail_work',

}
export enum EV_SERVICE_PLAN_NAME {
    INFO = 'Информация',
    INFO_GARANT = 'Информационный звонок Гарант',
    COMMER = 'Ответ на обращение', 
    PRESENTATION = 'Презентация',
    LEARNING_FIRST = 'Обучение Первичное',
    LEARNING = 'Обучение',
    SS = 'Сервисный сигнал', 
    DOCUMENTS = 'Документы',
    PERE_LONG = 'Общение по продлению',
    DEBIT = 'Дебиторка',
    FAIL = 'Обработка угрозы отказа',
}

export type EventPlanServiceCall = {
    id: number,
    code: EV_SERVICE_PLAN_CODE,
    name: EV_SERVICE_PLAN_NAME
}
export enum EV_PLAN_SERVICE_PROP {
    NAME = 'name',
    // DESCRIPTION = 'description',
    // RESPONSIBILITY = 'responsibility',
    // CREATED_BY = 'createdBy',
    DATE = 'date',
    TIME = 'time',
    TYPE = 'type',
    STATUS = 'status',
    IS_EXPIRED = 'isExpired',
    COMMUNICATION_TYPE = 'communicationType',
    INITIATIVE='initiative',
    
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



