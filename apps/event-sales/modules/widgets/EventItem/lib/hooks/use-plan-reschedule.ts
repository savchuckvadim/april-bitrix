'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan';
import { EventItemResultType } from '../../model/EventItemSlice';

export interface PlanRescheduleView {
    /** Колонка плана работает как перенос текущего дела, а не новый шаг. */
    isReschedule: boolean;
    /** Название типа переносимого события; null — типа в справочнике нет. */
    typeName: string | null;
}

/**
 * Режим переноса колонки плана.
 *
 * «Не очень» по существующему делу — это не новое событие, а то же самое на
 * другую дату: бэк двигает срок ТОЙ ЖЕ задачи, новой не создаёт. Тип при этом
 * не меняется, поэтому колонка не предлагает его выбирать.
 */
export const usePlanReschedule = (): PlanRescheduleView => {
    const menuType = useAppSelector(s => s.eventItemMenu.type);
    const hasCurrentTask = useAppSelector(s => Boolean(s.eventTask.current));
    const typeName = useAppSelector(
        s => s.eventPlan[EV_PLAN_PROP.TYPE].current?.name ?? null,
    );

    return {
        isReschedule:
            menuType === EventItemResultType.NORESULT && hasCurrentTask,
        typeName,
    };
};
