'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan';
import { getEventTypeLabel } from '@/modules/entities/EventTask/lib/event-request-type';
import {
    getEventTypeAttr,
    planCodeToEventType,
} from '@/modules/entities/EventTask/lib/event-type-token';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import { useEventNavigation } from '@/modules/processes/event';

export interface EntityEventRowView {
    /** Название дела; новое событие ещё без названия. */
    title: string;
    /** Метка типа для EventTypeBadge; null — задачи нет. */
    typeLabel: string | null;
    /** Значение data-event-type: цвет строки берут токены --event-current. */
    eventTypeAttr: string;
    contactIds: number[];
    backToList: () => void;
}

/**
 * Данные строки текущего дела в общей шапке.
 *
 * Цвет: отчитываемся по задаче — её тип, создаём новое — тип плана. Ровно то
 * же правило, что у контейнера формы: строка и форма не должны спорить.
 */
export const useEntityEventRow = (): EntityEventRowView => {
    const nav = useEventNavigation();
    const currentTask = useAppSelector(s => s.eventTask.current);
    const planType = useAppSelector(
        s => s.eventPlan[EV_PLAN_PROP.TYPE].current,
    );

    return {
        title: currentTask?.name || 'Новое событие',
        typeLabel: currentTask
            ? getEventTypeLabel({
                  eventType: currentTask.eventType,
                  type: currentTask.type,
                  ufCrmTask: currentTask.ufCrmTask,
              })
            : null,
        eventTypeAttr: currentTask
            ? getEventTypeAttr(currentTask.eventType)
            : planCodeToEventType(planType?.code),
        contactIds: getTaskLinks(currentTask).contactIds,
        // Форму сбросит EventProcessInit по факту прихода на список.
        backToList: () => nav.toList(),
    };
};
