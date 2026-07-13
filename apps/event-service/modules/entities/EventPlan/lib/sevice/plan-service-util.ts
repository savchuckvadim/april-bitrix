import { EventPlanServiceCall } from "../../type/event-plan-service-type";
import { EV_SERVICE_PLAN_CODE, EV_SERVICE_PLAN_NAME } from "../../type/event-plan-service-type";
import { format } from "date-fns";


export const createInitialStatePlanItems = (): EventPlanServiceCall[] => {
    const codes = Object.values(EV_SERVICE_PLAN_CODE) as string[];
    const names = Object.values(EV_SERVICE_PLAN_NAME) as string[];

    // Проверяем, что оба enum совпадают по длине
    if (codes.length !== names.length) {
        throw new Error('Mismatch between EV_SERVICE_PLAN_CODE and EV_SERVICE_PLAN_NAME');
    }

    return codes.map((code, index) => ({
        id: index + 1, // Устанавливаем уникальный ID
        code: code as EV_SERVICE_PLAN_CODE,
        name: names[index] as EV_SERVICE_PLAN_NAME,
    }));
};

export const getInitialDate = () => {
    // Текущая дата
    const currentDate = new Date();

    // Устанавливаем день месяца в 1, чтобы получить первый день текущего месяца
    const firstDayOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Форматируем обе даты
    const first = format(firstDayOfMonthDate, 'yyyy-MM-dd') as string;
    const current = format(currentDate, 'yyyy-MM-dd HH:mm') as string;
    return {
        first,
        current
    }

}