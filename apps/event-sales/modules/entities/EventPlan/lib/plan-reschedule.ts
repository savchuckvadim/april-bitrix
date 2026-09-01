import { eventTypeToPlanCode } from '@/modules/entities/EventTask/lib/event-type-token';
import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { EV_PLAN_CODE } from '../type/event-plan-type';
import { toPlanControlValue } from './plan-deadline';

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
    /**
     * Дедлайн задачи В ФОРМАТЕ КОНТРОЛА (`yyyy-MM-dd HH:mm`) — план правит
     * именно его; null — срока не было либо он не разобрался.
     *
     * Именно формат контрола, а не сырой ISO: DateTimePicker разбирает
     * строго свой формат, и ISO из `deadlineRaw` он показывал ПУСТОЙ датой —
     * менеджер ставил время, и перенос молча уезжал на СЕГОДНЯ
     * (todo3108 №2).
     */
    date: string | null;
    /** Код типа для справочника планов; в списке может не оказаться (cold). */
    typeCode: EV_PLAN_CODE;
}

export const buildRescheduleSeed = (task: EventTask): PlanSeed => ({
    name: task.name?.trim() ?? '',
    date: toPlanControlValue(task.deadlineRaw) || null,
    typeCode: eventTypeToPlanCode(task.eventType),
});
