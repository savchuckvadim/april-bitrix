import {
    EV_REPORT_PROP,
    EventReportStateReport,
} from '../type/event-report-type';

/**
 * Применение значения к полю отчёта с каскадами:
 * - workStatus=fail → активируется выбор типа отказа;
 * - failType=failure → активируется выбор причины отказа;
 * - смена причины недозвона переписывает её упоминание в комментарии.
 */
export const applyReportProp = (
    report: EventReportStateReport,
    propName: EV_REPORT_PROP,
    value: number | string,
): EventReportStateReport => {
    const result = { ...report };

    if (propName === EV_REPORT_PROP.COMMENT) {
        result[EV_REPORT_PROP.COMMENT] = value as string;
        return result;
    }

    const currentItem = result[propName].items.find(item => item.id == Number(value));
    if (!currentItem) return result;

    if (propName === EV_REPORT_PROP.WORK_STATUS) {
        if (currentItem.code == 'fail') {
            result[EV_REPORT_PROP.FAIL_TYPE] = {
                ...result[EV_REPORT_PROP.FAIL_TYPE],
                isActive: true,
            };
        } else {
            result[EV_REPORT_PROP.FAIL_TYPE] = {
                ...result[EV_REPORT_PROP.FAIL_TYPE],
                isActive: false,
            };
            result[EV_REPORT_PROP.FAIL_REASON] = {
                ...result[EV_REPORT_PROP.FAIL_REASON],
                isActive: false,
            };
        }
    } else if (propName === EV_REPORT_PROP.FAIL_TYPE) {
        result[EV_REPORT_PROP.FAIL_REASON] = {
            ...result[EV_REPORT_PROP.FAIL_REASON],
            isActive: currentItem.code == 'failure',
        };
    } else if (propName === EV_REPORT_PROP.NORESULT_REASON) {
        const prevName = result[EV_REPORT_PROP.NORESULT_REASON].current.name;
        const comment = result[EV_REPORT_PROP.COMMENT];
        if (comment && comment.includes(prevName)) {
            result[EV_REPORT_PROP.COMMENT] = comment.replace(prevName, currentItem.name);
        }
    }

    result[propName] = { ...result[propName], current: currentItem };
    return result;
};
