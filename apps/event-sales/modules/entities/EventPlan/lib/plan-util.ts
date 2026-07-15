import { format } from 'date-fns';
import {
    EV_PLAN_CODE,
    EV_PLAN_PROP,
    EventPlanCall,
    EvPlanStateItem,
} from '../type/event-plan-type';

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

/** Начальное состояние плана; ТМЦ планирует только звонок/презентацию. */
export const getPlanInitState = (isTmcMode: boolean) => ({
    [EV_PLAN_PROP.TYPE]: {
        items: isTmcMode ? PLAN_CALL_TYPES.slice(0, 2) : PLAN_CALL_TYPES,
        current: null,
        isChanged: false,
    } as EvPlanStateItem,
    [EV_PLAN_PROP.NAME]: '' as string,
    [EV_PLAN_PROP.DATE]: getInitialDate().current as string,
    [EV_PLAN_PROP.TIME]: null as string | null,
    [EV_PLAN_PROP.IS_ACTIVE]: true as boolean,
    [EV_PLAN_PROP.IS_EXPIRED]: false as boolean,
});

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
