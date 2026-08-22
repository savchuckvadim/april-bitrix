import { eventTypeToPlanCode } from '@/modules/entities/EventTask/lib/event-type-token';
import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { EV_PLAN_CODE } from '../type/event-plan-type';

/**
 * Перенос события: что подставить в план от текущей задачи.
 *
 * «Не очень» — это не новое дело, а то же самое, уехавшее на другую дату.
 * Поэтому план встаёт на данные текущей задачи: то же название, тот же тип,
 * та же дата (её и правят), тот же контакт — менеджеру остаётся сдвинуть срок.
 * Раньше он заполнял всё заново, а чаще не заполнял вовсе: тип оставался
 * пустым, и бэк вместо переноса ЗАКРЫВАЛ задачу, не создав новую.
 */
export interface PlanSeed {
    name: string;
    /** Дедлайн задачи (ISO) — план правит именно его; null — срока не было. */
    date: string | null;
    /** Код типа для справочника планов; в списке может не оказаться (cold). */
    typeCode: EV_PLAN_CODE;
}

export const buildRescheduleSeed = (task: EventTask): PlanSeed => ({
    name: task.name?.trim() ?? '',
    date: task.deadlineRaw ?? null,
    typeCode: eventTypeToPlanCode(task.eventType),
});
