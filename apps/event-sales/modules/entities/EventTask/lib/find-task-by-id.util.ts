import type { EventTask } from '../types/event-task-type';

/**
 * Задача списка дел по id. Портал отдаёт id задачи строкой, кнопки
 * недозвона и возврата в ТМЦ передают число — сравнение «как есть» не
 * находило задачу, и отчёт уходил на бэк без текущей задачи: недозвон без
 * типа события и записей KPI, возврат в ТМЦ без ТМЦ-сделки. Сравниваем
 * числами.
 */
export const findTaskById = (
    tasks: readonly EventTask[] | null | undefined,
    taskId: number | string | null | undefined,
): EventTask | null => {
    const wanted = Number(taskId);
    if (!Number.isFinite(wanted) || wanted <= 0) return null;
    return tasks?.find(task => Number(task.id) === wanted) ?? null;
};
