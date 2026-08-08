/**
 * Кастомное pbx-поле задачи «Комментарий события»: пишется при планировании
 * дела и раньше нигде не отображалось.
 *
 * Паспорт поля (pbx-шаблон): code `event_comment`, appType task,
 * bxFieldName EVENT_COMMENT → в Bitrix это UF-поле TASKS_TASK
 * `UF_TASK_EVENT_COMMENT` (string, не множественное).
 */

/** Имя поля для select/filter методов tasks.task.* (SCREAMING_SNAKE). */
export const EVENT_COMMENT_UF_FIELD = 'UF_TASK_EVENT_COMMENT';

/** Ключ того же поля в camelCase-ответе tasks.task.*. */
const EVENT_COMMENT_RESPONSE_KEY = 'ufTaskEventComment';

/**
 * Комментарий планирования из сырой задачи Bitrix. Пустые UF Битрикс отдаёт
 * как '' / null / false — всё это схлопывается в null: «нет комментария».
 */
export const getTaskEventComment = (task: unknown): string | null => {
    const value = (task as Record<string, unknown> | null | undefined)?.[
        EVENT_COMMENT_RESPONSE_KEY
    ];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};
