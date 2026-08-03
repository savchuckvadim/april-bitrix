import {
    EV_REPORT_PROP,
    EventReportCode,
    EventReportSelect,
    EventReportSelectItem,
    EventReportStateReport,
} from '../type/event-report-type';

/** Значение из UI приходит строкой (id в Select) или числом (thunk'и). */
const findItem = <TCode extends EventReportCode>(
    select: EventReportSelect<TCode>,
    value: number | string,
): EventReportSelectItem<TCode> | undefined =>
    select.items.find(item => item.id === Number(value));

/** workStatus=fail → активен выбор типа отказа; иначе тип и причина гасятся. */
const applyWorkStatus = (
    report: EventReportStateReport,
    value: number | string,
): EventReportStateReport => {
    const current = findItem(report[EV_REPORT_PROP.WORK_STATUS], value);
    if (!current) return report;

    const isFail = current.code === 'fail';

    return {
        ...report,
        [EV_REPORT_PROP.WORK_STATUS]: {
            ...report[EV_REPORT_PROP.WORK_STATUS],
            current,
        },
        [EV_REPORT_PROP.FAIL_TYPE]: {
            ...report[EV_REPORT_PROP.FAIL_TYPE],
            isActive: isFail,
        },
        [EV_REPORT_PROP.FAIL_REASON]: isFail
            ? report[EV_REPORT_PROP.FAIL_REASON]
            : { ...report[EV_REPORT_PROP.FAIL_REASON], isActive: false },
    };
};

/** failType=failure → активен выбор причины отказа. */
const applyFailType = (
    report: EventReportStateReport,
    value: number | string,
): EventReportStateReport => {
    const current = findItem(report[EV_REPORT_PROP.FAIL_TYPE], value);
    if (!current) return report;

    return {
        ...report,
        [EV_REPORT_PROP.FAIL_TYPE]: { ...report[EV_REPORT_PROP.FAIL_TYPE], current },
        [EV_REPORT_PROP.FAIL_REASON]: {
            ...report[EV_REPORT_PROP.FAIL_REASON],
            isActive: current.code === 'failure',
        },
    };
};

const applyFailReason = (
    report: EventReportStateReport,
    value: number | string,
): EventReportStateReport => {
    const current = findItem(report[EV_REPORT_PROP.FAIL_REASON], value);
    if (!current) return report;

    return {
        ...report,
        [EV_REPORT_PROP.FAIL_REASON]: { ...report[EV_REPORT_PROP.FAIL_REASON], current },
    };
};

/** Смена причины недозвона переписывает её упоминание в комментарии. */
const applyNoresultReason = (
    report: EventReportStateReport,
    value: number | string,
): EventReportStateReport => {
    const select = report[EV_REPORT_PROP.NORESULT_REASON];
    const current = findItem(select, value);
    if (!current) return report;

    const prevName = select.current.name;
    const comment = report[EV_REPORT_PROP.COMMENT];

    return {
        ...report,
        [EV_REPORT_PROP.NORESULT_REASON]: { ...select, current },
        [EV_REPORT_PROP.COMMENT]:
            comment && comment.includes(prevName)
                ? comment.replace(prevName, current.name)
                : comment,
    };
};

/**
 * Применение значения к полю отчёта с каскадами активности связанных полей.
 * Для справочников value — это id элемента, для комментария — текст.
 */
export const applyReportProp = (
    report: EventReportStateReport,
    propName: EV_REPORT_PROP,
    value: number | string,
): EventReportStateReport => {
    switch (propName) {
        case EV_REPORT_PROP.COMMENT:
            return { ...report, [EV_REPORT_PROP.COMMENT]: String(value) };
        case EV_REPORT_PROP.WORK_STATUS:
            return applyWorkStatus(report, value);
        case EV_REPORT_PROP.FAIL_TYPE:
            return applyFailType(report, value);
        case EV_REPORT_PROP.FAIL_REASON:
            return applyFailReason(report, value);
        case EV_REPORT_PROP.NORESULT_REASON:
            return applyNoresultReason(report, value);
    }
};
