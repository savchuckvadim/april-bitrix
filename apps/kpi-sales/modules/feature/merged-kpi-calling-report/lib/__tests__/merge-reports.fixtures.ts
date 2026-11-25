import type { BXUser } from '@workspace/bx';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import type { KPICall } from '@/modules/entities/calling-statistics/type/calling-type';
import type {
    Filter,
    KPI,
    ReportData,
} from '@/modules/entities/report/model/types/report/report-type';

/**
 * Фикстуры объединённого отчёта: строки событий (ReportData) и звонков
 * (ReportCallingData) в том виде, в каком их отдаёт сервер. Лишние поля
 * Bitrix-пользователя и фильтра в логике не участвуют — приведение типа
 * только для них (как в соседних тестах).
 */

export const makeUser = (id: number, name: string, lastName: string): BXUser =>
    ({ ID: id, NAME: name, LAST_NAME: lastName }) as unknown as BXUser;

const makeFilter = (innerCode: string, name: string): Filter =>
    ({ innerCode, name, code: innerCode }) as unknown as Filter;

/** Показатель событий: id, внутренний код, название и значение. */
export const makeKpi = (
    id: number,
    innerCode: string,
    name: string,
    count: number,
): KPI => ({ id, action: makeFilter(innerCode, name), count });

/** Показатель звонков: id длительности, название и значение. */
export const makeCall = (
    id: string,
    action: string,
    count: number,
): KPICall => ({ id, action, count }) as unknown as KPICall;

export const makeEventsRow = (
    id: number,
    name: string,
    lastName: string,
    kpi: KPI[],
): ReportData => ({
    id,
    user: makeUser(id, name, lastName),
    userName: `${name} ${lastName}`,
    kpi,
});

export const makeCallingRow = (
    id: number,
    name: string,
    lastName: string,
    callings: KPICall[],
): ReportCallingData => ({
    userId: id,
    userName: `${name} ${lastName}`,
    user: makeUser(id, name, lastName),
    callings,
});

/** Названия показателей звонков (порядок колонок звонков). */
export const CALL_ALL = 'Наборов номера';
export const CALL_HALF = 'Звонки > 30 сек';
export const CALL_MINUTE = 'Звонки > минуты';

/** Названия показателей событий. */
export const EV_PLAN = 'План';
export const EV_EFFECTIVE = 'Результативные';
export const EV_CALL_DONE = 'Звонок совершен';
export const EV_PRESENTATION = 'Презентация проведена';
export const EV_OFFER = 'КП отправлено';

/**
 * Показатели событий сотрудника: три «лишних» для объединённого отчёта
 * (План, Результативные, Звонок совершен) и два нужных. Если задан
 * collidingWithCall — ещё один показатель с названием показателя звонков
 * (экран объединённого отчёта его не дублирует).
 */
export const eventKpi = (
    plan: number,
    effective: number,
    callDone: number,
    presentation: number,
    offer: number,
    collidingWithCall?: number,
): KPI[] => [
    makeKpi(100, 'result_communication_plan', EV_PLAN, plan),
    makeKpi(101, 'result_communication_done', EV_EFFECTIVE, effective),
    makeKpi(102, 'call_done', EV_CALL_DONE, callDone),
    makeKpi(103, 'presentation_done', EV_PRESENTATION, presentation),
    makeKpi(104, 'ev_offer_act_send', EV_OFFER, offer),
    ...(collidingWithCall === undefined
        ? []
        : [makeKpi(105, 'call_pound', CALL_HALF, collidingWithCall)]),
];

/** Показатели звонков сотрудника: три колонки в фиксированном порядке. */
export const callKpi = (all: number, half: number, minute: number): KPICall[] => [
    makeCall('all', CALL_ALL, all),
    makeCall('30', CALL_HALF, half),
    makeCall('60', CALL_MINUTE, minute),
];

/**
 * Все три сотрудника есть в обоих источниках, порядок одинаковый;
 * у каждого есть показатель с названием показателя звонков.
 */
export const EVENTS_ALL: ReportData[] = [
    makeEventsRow(10, 'Иван', 'Иванов', eventKpi(5, 4, 9, 3, 2, 99)),
    makeEventsRow(20, 'Пётр', 'Петров', eventKpi(8, 6, 11, 5, 1, 98)),
    makeEventsRow(30, 'Сидор', 'Сидоров', eventKpi(2, 1, 3, 0, 0, 97)),
];

/** То же, но без показателя, совпадающего по названию с показателем звонков. */
export const EVENTS_PLAIN: ReportData[] = [
    makeEventsRow(10, 'Иван', 'Иванов', eventKpi(5, 4, 9, 3, 2)),
    makeEventsRow(20, 'Пётр', 'Петров', eventKpi(8, 6, 11, 5, 1)),
    makeEventsRow(30, 'Сидор', 'Сидоров', eventKpi(2, 1, 3, 0, 0)),
];

export const CALLINGS_ALL: ReportCallingData[] = [
    makeCallingRow(10, 'Иван', 'Иванов', callKpi(40, 25, 12)),
    makeCallingRow(20, 'Пётр', 'Петров', callKpi(30, 18, 7)),
    makeCallingRow(30, 'Сидор', 'Сидоров', callKpi(10, 5, 1)),
];

/**
 * Смешанный состав. Звонки: 20, 10 (оба есть и в событиях) и 30 (только
 * звонки). События: 10, 40 (только события), 20.
 */
export const CALLINGS_MIXED: ReportCallingData[] = [
    makeCallingRow(20, 'Пётр', 'Петров', callKpi(30, 18, 7)),
    makeCallingRow(10, 'Иван', 'Иванов', callKpi(40, 25, 12)),
    makeCallingRow(30, 'Сидор', 'Сидоров', callKpi(10, 5, 1)),
];

export const EVENTS_MIXED: ReportData[] = [
    makeEventsRow(10, 'Иван', 'Иванов', eventKpi(5, 4, 9, 3, 2)),
    makeEventsRow(40, 'Анна', 'Антонова', eventKpi(1, 1, 1, 7, 6)),
    makeEventsRow(20, 'Пётр', 'Петров', eventKpi(8, 6, 11, 5, 1)),
];
