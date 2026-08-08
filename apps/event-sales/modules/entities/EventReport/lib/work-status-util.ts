import {
    EV_REPORT_PROP,
    EventReportSelectItem,
    EventReportStateReport,
    WorkStatusCode,
} from '../type/event-report-type';

/**
 * Видимые статусы работы: в ТМЦ и без компании нет «Продажи»; «В работе» и «Отложено»
 * взаимоисключаются в зависимости от текущего выбора.
 */
export const getCurrentWorkStatusItems = (
    report: EventReportStateReport,
    departmentModeCode: 'sales' | 'tmc',
    isWithoutCompany = false,
): Array<EventReportSelectItem<WorkStatusCode>> => {
    const isTmc = departmentModeCode === 'tmc';
    const currentCode: WorkStatusCode =
        report[EV_REPORT_PROP.WORK_STATUS].current.code;

    let items = report[EV_REPORT_PROP.WORK_STATUS].items;
    // «Продажа» требует компанию: без неё сделка продажи и её привязки
    // не создаются, а отчёт молча уходит в никуда. Отказ при этом разрешён.
    if (isTmc || isWithoutCompany) {
        items = items.filter(item => item.code !== 'success');
    }

    return items.filter(item => {
        const isCurrent = item.code == currentCode;
        if (currentCode === 'setAside' && isCurrent) return item.code !== 'inJob';
        if (currentCode === 'inJob' && isCurrent) return item.code !== 'setAside';
        return item.code !== 'setAside';
    });
};
