'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';

export interface TaskLinkTools {
    /** Заявка привязана к самой задаче (L_* в UF_CRM_TASK). */
    isLeadLinked: boolean;
    /** Контакт привязан к самой задаче (C_* в UF_CRM_TASK). */
    isContactLinked: boolean;
    /** Контакт выбран для отчёта — не обязательно тот же, что у задачи. */
    hasReportContact: boolean;
}

/**
 * Что у ТЕКУЩЕГО ДЕЛА реально прикреплено.
 *
 * Иконки в пульте раньше отвечали на вопрос «чего не хватает» и исчезали,
 * стоило добавить, — по экрану нельзя было понять, есть ли у дела заявка и
 * контакт. Теперь иконки на месте всегда, а признак берётся из привязок
 * задачи (`UF_CRM_TASK`), а не из слота в сторе: слот один на приложение и в
 * нём может лежать контакт, к делу отношения не имеющий.
 */
export const useTaskLinkTools = (): TaskLinkTools => {
    const currentTask = useAppSelector(s => s.eventTask.current);
    const hasReportContact = useAppSelector(s =>
        Boolean(s.contact.current.report),
    );

    const links = getTaskLinks(currentTask);

    return {
        isLeadLinked: links.leadIds.length > 0,
        isContactLinked: links.contactIds.length > 0,
        hasReportContact,
    };
};
