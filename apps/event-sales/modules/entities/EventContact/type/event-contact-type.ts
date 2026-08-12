export interface EVContact {
    [EV_CONTACT_PROP.ID]: string;
    [EV_CONTACT_PROP.NAME]: string;
    [EV_CONTACT_PROP.PHONE]: string;
    [EV_CONTACT_PROP.EMAIL]: string;
}

export enum EV_CONTACT_PROP {
    ID = 'ID',
    NAME = 'NAME',
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    POST = 'POST',
}

export enum EV_CONTACT_TYPE {
    PLAN = 'plan',
    REPORT = 'report',
}

/**
 * Откуда взялся контакт.
 *
 * Контакты живут не только в компании: её может не быть вовсе (сделка без
 * компании, лид), а разговаривать всё равно с кем-то надо. Источник помним и
 * показываем — «из лида сделки» объясняет, почему в списке компании оказался
 * незнакомый человек, и не даёт спутать однофамильцев.
 */
export type ContactSource =
    /** Контакты компании (crm.company.contact.items.get). */
    | 'company'
    /** Контакты самой сделки, включая её CONTACT_ID. */
    | 'deal'
    /** Контакт текущего лида. */
    | 'lead'
    /** Контакт лида, связанного со сделкой или привязанного к задаче. */
    | 'relatedLead'
    /** Контакт из CRM-привязок задачи (C_xxx). */
    | 'task';
