
export interface EVContact {
    [EV_CONTACT_PROP.ID]: string
    [EV_CONTACT_PROP.NAME]: string
    [EV_CONTACT_PROP.PHONE]: string
    [EV_CONTACT_PROP.EMAIL]: string
}

export enum EV_CONTACT_PROP {
    ID='ID',
    NAME = 'NAME',
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    POST='POST',

}

export enum EV_CONTACT_TYPE {
    PLAN='plan',
    REPORT = 'report',

}

export enum EV_TYPE {
    PLAN='plan',
    REPORT = 'report',

}