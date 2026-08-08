import { format } from 'date-fns';
import type { ClientContext } from '@/modules/app/lib/utills/app-state-util';
import {
    EV_PLAN_CODE,
    EV_PLAN_PROP,
    EventPlanCall,
    EvPlanStateItem,
} from '../type/event-plan-type';
import { getAllowedPlanCodes } from './plan-rules';

/** Типы планируемых событий (единственный источник). */
export const PLAN_CALL_TYPES: EventPlanCall[] = [
    { id: 1, code: EV_PLAN_CODE.WARM, name: 'Звонок' },
    { id: 2, code: EV_PLAN_CODE.PRESENTATION, name: 'Презентация' },
    { id: 3, code: EV_PLAN_CODE.HOT, name: 'Решение' },
    { id: 4, code: EV_PLAN_CODE.PAY, name: 'Оплата' },
    { id: 5, code: EV_PLAN_CODE.SUPPLY, name: 'Поставка' },
];

export const getInitialDate = () => {
    const currentDate = new Date();
    const firstDayOfMonthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
    );
    return {
        first: format(firstDayOfMonthDate, 'yyyy-MM-dd'),
        current: format(currentDate, 'yyyy-MM-dd HH:mm'),
    };
};

/**
 * Начальное состояние плана. Набор доступных типов события — от контекста
 * клиента и режима отдела (правила-данные в plan-rules.ts, итог —
 * пересечение). Всплывашка «добавьте компанию, запишите ИНН» — фича
 * NoCompanyChip/Inn (см. docs/event-sales-no-company-inn.tasks.md).
 */
export const getPlanInitState = (
    isTmcMode: boolean,
    context: ClientContext,
    isAfterSale = false,
    isAllTypesShown = false,
) => ({
    [EV_PLAN_PROP.TYPE]: {
        items: getPlanCallInitTypes(isTmcMode, context, isAfterSale, isAllTypesShown),
        current: null,
        isChanged: false,
    } as EvPlanStateItem,
    [EV_PLAN_PROP.NAME]: '' as string,
    [EV_PLAN_PROP.DATE]: getInitialDate().current as string,
    [EV_PLAN_PROP.TIME]: null as string | null,
    [EV_PLAN_PROP.IS_ACTIVE]: true as boolean,
    [EV_PLAN_PROP.IS_EXPIRED]: false as boolean,
    [EV_PLAN_PROP.IS_IMPORTANT]: false as boolean,
});

/** Фильтр по кодам, не по позициям: порядок PLAN_CALL_TYPES больше не несущий. */
const getPlanCallInitTypes = (
    isTmcMode: boolean,
    context: ClientContext,
    isAfterSale: boolean,
    isAllTypesShown: boolean,
): EventPlanCall[] => {
    const allowed = getAllowedPlanCodes({
        context,
        isTmc: isTmcMode,
        isAfterSale,
        isAllTypesShown,
    });
    return PLAN_CALL_TYPES.filter(item => allowed.includes(item.code));
};


/** Дата дальше чем на 4 месяца от текущей — событие «отложено». */
export function isDifferenceMoreThanFourMonths(inputDate: string): boolean {
    const dateFromInput = new Date(inputDate);
    const currentDate = new Date();
    const monthsDifference =
        (currentDate.getFullYear() - dateFromInput.getFullYear()) * 12 +
        currentDate.getMonth() -
        dateFromInput.getMonth();
    return Math.abs(monthsDifference) > 4;
}
