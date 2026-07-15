import {
    EV_REPORT_PROP,
    EventReportSelect,
    EventReportSelectItem,
    EventReportStateReport,
} from '../type/event-report-type';

/**
 * Справочники отчёта (единственный источник; legacy дублировал их
 * в initialState и getInitReportState).
 */
export const WORK_STATUS_ITEMS: EventReportSelectItem[] = [
    { id: 0, code: 'inJob', name: 'В работе', isActive: true },
    { id: 1, code: 'setAside', name: 'Отложено', isActive: true },
    { id: 2, code: 'success', name: 'Продажа', isActive: true },
    { id: 3, code: 'fail', name: 'Отказ', isActive: true },
];

export const NORESULT_REASON_ITEMS: EventReportSelectItem[] = [
    { id: 0, code: 'secretar', name: 'Секретарь', isActive: true },
    { id: 1, code: 'nopickup', name: 'Недозвон - трубку не берут', isActive: true },
    { id: 2, code: 'nonumber', name: 'Недозвон - номер не существует', isActive: true },
    { id: 3, code: 'busy', name: 'Занято', isActive: true },
    { id: 4, code: 'noresult_notime', name: 'Перенос - не было времени', isActive: true },
    { id: 5, code: 'nocontact', name: 'Контактера нет на месте', isActive: true },
    { id: 6, code: 'giveup', name: 'Просят оставить свой номер', isActive: true },
    { id: 7, code: 'bay', name: 'Не интересует, до свидания', isActive: true },
    { id: 8, code: 'wrong', name: 'По телефону отвечает не та организация', isActive: true },
    { id: 9, code: 'auto', name: 'Автоответчик', isActive: true },
];

export const FAIL_TYPE_ITEMS: EventReportSelectItem[] = [
    { id: 2, code: 'garant', name: 'Гарант/Запрет', isActive: true },
    { id: 3, code: 'go', name: 'Покупает ГО', isActive: true },
    { id: 4, code: 'territory', name: 'Чужая территория', isActive: true },
    { id: 5, code: 'accountant', name: 'Бухприх', isActive: true },
    { id: 6, code: 'autsorc', name: 'Аутсорсинг', isActive: true },
    { id: 7, code: 'depend', name: 'Несамостоятельная организация', isActive: true },
    { id: 8, code: 'op_prospects_nophone', name: 'Недозвон', isActive: true },
    { id: 9, code: 'op_prospects_company', name: 'Компания не существует', isActive: true },
    { id: 10, code: 'failure', name: 'Отказ', isActive: true },
];

export const FAIL_REASON_ITEMS: EventReportSelectItem[] = [
    { id: 0, code: 'fail_notime', name: 'Не было времени', isActive: true },
    { id: 1, code: 'c_habit', name: 'Конкуренты - привыкли', isActive: true },
    { id: 2, code: 'c_prepay', name: 'Конкуренты - оплачено', isActive: true },
    { id: 3, code: 'c_price', name: 'Конкуренты - цена', isActive: true },
    { id: 4, code: 'to_expensive', name: 'Дорого/нет Денег', isActive: true },
    { id: 5, code: 'to_cheap', name: 'Слишком дешево', isActive: true },
    { id: 6, code: 'nomoney', name: 'Нет денег', isActive: true },
    { id: 7, code: 'noneed', name: 'Не видят надобности', isActive: true },
    { id: 8, code: 'lpr', name: 'ЛПР против', isActive: true },
    { id: 9, code: 'employee', name: 'Ключевой сотрудник против', isActive: true },
    { id: 10, code: 'fail_off', name: 'Не хотят общаться', isActive: true },
];

const buildSelect = (
    items: EventReportSelectItem[],
    defaultIndex: number,
    isActive: boolean,
): EventReportSelect => ({
    items,
    current: items[defaultIndex]!,
    default: items[defaultIndex]!,
    isActive,
    isChanged: false,
});

/** Начальное состояние отчёта; в режиме ТМЦ статус «Продажа» недоступен. */
export const buildInitialReport = (isTmc: boolean): EventReportStateReport => ({
    [EV_REPORT_PROP.WORK_STATUS]: buildSelect(
        isTmc
            ? WORK_STATUS_ITEMS.filter(item => item.code !== 'success')
            : WORK_STATUS_ITEMS,
        0,
        true,
    ),
    [EV_REPORT_PROP.NORESULT_REASON]: buildSelect(NORESULT_REASON_ITEMS, 1, false),
    [EV_REPORT_PROP.FAIL_TYPE]: buildSelect(FAIL_TYPE_ITEMS, 0, false),
    [EV_REPORT_PROP.FAIL_REASON]: buildSelect(FAIL_REASON_ITEMS, 0, false),
    [EV_REPORT_PROP.COMMENT]: '',
});
