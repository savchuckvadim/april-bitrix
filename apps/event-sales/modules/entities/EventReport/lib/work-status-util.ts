import {
    EV_REPORT_PROP,
    EventReportSelectItem,
    EventReportStateReport,
} from '../type/event-report-type';

/**
 * Видимые статусы работы: в ТМЦ нет «Продажи»; «В работе» и «Отложено»
 * взаимоисключаются в зависимости от текущего выбора.
 */
export const getCurrentWorkStatusItems = (
    report: EventReportStateReport,
    departmentModeCode: 'sales' | 'tmc',
): Array<EventReportSelectItem> => {
    const isTmc = departmentModeCode === 'tmc';
    const currentCode = report[EV_REPORT_PROP.WORK_STATUS].current.code;

    let items = report[EV_REPORT_PROP.WORK_STATUS].items;
    if (isTmc) {
        items = items.filter(item => item.code !== 'success');
    }

    return items.filter(item => {
        const isCurrent = item.code == currentCode;
        if (currentCode === 'setAside' && isCurrent) return item.code !== 'inJob';
        if (currentCode === 'inJob' && isCurrent) return item.code !== 'setAside';
        return item.code !== 'setAside';
    });
};
