export enum EV_REPORT_PROP {
    WORK_STATUS = 'workStatus',
    NORESULT_REASON = 'noresultReason',
    FAIL_TYPE = 'failType',
    FAIL_REASON = 'failReason',
    COMMENT = 'comment',
}

export type EventReportSelectItem = {
    id: number;
    code: string;
    name: string;
    isActive: boolean;
};

export type EventReportSelect = {
    items: Array<EventReportSelectItem>;
    current: EventReportSelectItem;
    default: EventReportSelectItem;
    isActive: boolean;
    isChanged: boolean;
};

export type EventReportStateReport = {
    [EV_REPORT_PROP.WORK_STATUS]: EventReportSelect;
    [EV_REPORT_PROP.NORESULT_REASON]: EventReportSelect;
    [EV_REPORT_PROP.FAIL_TYPE]: EventReportSelect;
    [EV_REPORT_PROP.FAIL_REASON]: EventReportSelect;
    [EV_REPORT_PROP.COMMENT]: string;
};

export type WorkStatusCode = 'inJob' | 'setAside' | 'success' | 'fail';
