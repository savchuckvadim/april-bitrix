import {
    ETaskLinkType,
    TaskLinkRef,
    TaskLinks,
    getTaskLinkRefs,
} from './task-links';

/**
 * Приоритетная сущность задачи + остальные её связи.
 *
 * Открывшись из задачи, приложение работает «как будто в сущности», но в
 * рамках этой задачи. Приоритет: компания > сделка > лид > контакт — компания
 * остаётся самым широким контекстом (консистентно с entity-descriptor в
 * RelatedCrm); сделка/лид берутся, когда компании у задачи нет.
 */
export interface TaskPrimaryContext {
    primary: TaskLinkRef | null;
    /** Остальные связи — для бледного счётчика в карточке текущего события. */
    others: TaskLinkRef[];
}

const PRIORITY = [
    ETaskLinkType.COMPANY,
    ETaskLinkType.DEAL,
    ETaskLinkType.LEAD,
    ETaskLinkType.CONTACT,
] as const;

export const resolveTaskPrimaryContext = (
    links: TaskLinks,
): TaskPrimaryContext => {
    const refs = getTaskLinkRefs(links);
    for (const type of PRIORITY) {
        const primary = refs.find(ref => ref.type === type);
        if (primary) {
            return {
                primary,
                others: refs.filter(ref => ref !== primary),
            };
        }
    }
    return { primary: null, others: [] };
};
