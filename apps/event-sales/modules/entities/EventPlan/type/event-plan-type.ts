export enum EV_PLAN_CODE {
    COLD = 'cold',
    WARM = 'warm',
    PRESENTATION = 'presentation',
    HOT = 'hot',
    PAY = 'moneyAwait',
    SUPPLY = 'supply',
}

export type EventPlanCall = {
    id: number;
    code: EV_PLAN_CODE;
    name: string;
};

export enum EV_PLAN_PROP {
    NAME = 'name',
    DATE = 'date',
    TIME = 'time',
    TYPE = 'type',
    STATUS = 'status',
    IS_EXPIRED = 'isExpired',
    IS_ACTIVE = 'isActive',
}

export type EvPlanStateItem = {
    items: Array<EventPlanCall>;
    current: EventPlanCall | null;
    isChanged: boolean;
};
