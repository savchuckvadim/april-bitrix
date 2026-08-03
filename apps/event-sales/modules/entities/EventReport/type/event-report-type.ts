export enum EV_REPORT_PROP {
    WORK_STATUS = 'workStatus',
    NORESULT_REASON = 'noresultReason',
    FAIL_TYPE = 'failType',
    FAIL_REASON = 'failReason',
    COMMENT = 'comment',
}

/**
 * Коды справочников отчёта — закрытые наборы, а не произвольные строки.
 * Единственный источник значений — WORK_STATUS_ITEMS / NORESULT_REASON_ITEMS /
 * FAIL_TYPE_ITEMS / FAIL_REASON_ITEMS в lib/report-catalog.
 */
export type WorkStatusCode = 'inJob' | 'setAside' | 'success' | 'fail';

export type NoresultReasonCode =
    | 'secretar'
    | 'nopickup'
    | 'nonumber'
    | 'busy'
    | 'noresult_notime'
    | 'nocontact'
    | 'giveup'
    | 'bay'
    | 'wrong'
    | 'auto';

export type FailTypeCode =
    | 'garant'
    | 'go'
    | 'territory'
    | 'accountant'
    | 'autsorc'
    | 'depend'
    | 'op_prospects_nophone'
    | 'op_prospects_company'
    | 'failure';

export type FailReasonCode =
    | 'fail_notime'
    | 'c_habit'
    | 'c_prepay'
    | 'c_price'
    | 'to_expensive'
    | 'to_cheap'
    | 'nomoney'
    | 'noneed'
    | 'lpr'
    | 'employee'
    | 'fail_off';

export type EventReportCode =
    | WorkStatusCode
    | NoresultReasonCode
    | FailTypeCode
    | FailReasonCode;

export type EventReportSelectItem<TCode extends EventReportCode = EventReportCode> = {
    id: number;
    code: TCode;
    name: string;
    isActive: boolean;
};

export type EventReportSelect<TCode extends EventReportCode = EventReportCode> = {
    items: Array<EventReportSelectItem<TCode>>;
    current: EventReportSelectItem<TCode>;
    default: EventReportSelectItem<TCode>;
    isActive: boolean;
    isChanged: boolean;
};

/** Поля отчёта, которые являются справочником (всё, кроме комментария). */
export type EventReportSelectProp = Exclude<EV_REPORT_PROP, EV_REPORT_PROP.COMMENT>;

export type EventReportStateReport = {
    [EV_REPORT_PROP.WORK_STATUS]: EventReportSelect<WorkStatusCode>;
    [EV_REPORT_PROP.NORESULT_REASON]: EventReportSelect<NoresultReasonCode>;
    [EV_REPORT_PROP.FAIL_TYPE]: EventReportSelect<FailTypeCode>;
    [EV_REPORT_PROP.FAIL_REASON]: EventReportSelect<FailReasonCode>;
    [EV_REPORT_PROP.COMMENT]: string;
};
