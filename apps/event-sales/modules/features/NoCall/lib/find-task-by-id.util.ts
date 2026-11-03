import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';

/**
 * Задача списка дел по id. Портал отдаёт id задачи строкой, кнопка
 * недозвона передаёт число — сравнение «как есть» не находило задачу, и
 * недозвон уходил на бэк без текущей задачи: ни типа события, ни записи
 * «Звонок не состоялся» в KPI и истории. Сравниваем числами.
 */
export const findTaskById = (
    tasks: readonly EventTask[] | null | undefined,
    taskId: number | string | null | undefined,
): EventTask | null => {
    const wanted = Number(taskId);
    if (!Number.isFinite(wanted) || wanted <= 0) return null;
    return tasks?.find(task => Number(task.id) === wanted) ?? null;
};
