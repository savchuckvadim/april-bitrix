import {
    EV_REPORT_PROP,
    EventReportSelectItem,
    EventReportStateReport,
    WorkStatusCode,
} from '../type/event-report-type';

/**
 * Видимые статусы работы: в ТМЦ и там, где продажу оформить нельзя
 * (getCanSellContext: нет ни сделки, ни компании), нет «Продажи»; «В работе»
 * и «Отложено» взаимоисключаются в зависимости от текущего выбора.
 */
export const getCurrentWorkStatusItems = (
    report: EventReportStateReport,
    departmentModeCode: 'sales' | 'tmc',
    canSell = true,
): Array<EventReportSelectItem<WorkStatusCode>> => {
    const isTmc = departmentModeCode === 'tmc';
    const currentCode: WorkStatusCode =
        report[EV_REPORT_PROP.WORK_STATUS].current.code;

    let items = report[EV_REPORT_PROP.WORK_STATUS].items;
    // «Продажа» закрывает сделку в «Успех» — без сделки и компании (чистый
    // лид) закрывать нечего. Отказ при этом разрешён.
    if (isTmc || !canSell) {
        items = items.filter(item => item.code !== 'success');
    }

    return items.filter(item => {
        const isCurrent = item.code == currentCode;
        if (currentCode === 'setAside' && isCurrent)
            return item.code !== 'inJob';
        if (currentCode === 'inJob' && isCurrent)
            return item.code !== 'setAside';
        return item.code !== 'setAside';
    });
};
