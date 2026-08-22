import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import type { EventTask } from '@/modules/entities/EventTask';
import { isLeadOpen } from '@/modules/entities/RelatedCrm';
import type { RelatedLead } from '@/modules/entities/RelatedCrm';

/**
 * Кого предлагать связать с новой задачей.
 *
 * Задача — носитель связей, а не их источник: каждую новую задачу task-flow
 * собирает заново, и лид она получает от ТЕКУЩЕЙ задачи цепочки. Значит
 * спрашивать нужно ровно тогда, когда наследовать нечего: текущей задачи нет
 * вовсе (новая цепочка) ИЛИ у текущей задачи лида не указано. Раньше условие
 * смотрело только на факт текущей задачи — дело без заявки молча создавало
 * следующее тоже без заявки, и путь заявки обрывался.
 *
 * Кандидаты — открытые связанные лиды клиента: их бывает несколько (заявка с
 * сайта, повторный лид, холодный), поэтому менеджер отмечает нужные сам.
 */

export interface TaskLeadLinksInput {
    /** Задача, по которой сейчас отчитываются; null — создаётся новая. */
    currentTask: EventTask | null;
    /** План активен: без следующего шага связывать нечего. */
    planActive: boolean;
    /** Связанные лиды клиента (граф связей). */
    leads?: RelatedLead[];
}

export interface TaskLeadLinksView {
    visible: boolean;
    candidates: RelatedLead[];
}

/**
 * Новая задача унаследует лид от текущей — спрашивать нечего.
 * Тем же правилом гейтится отправка (`plan.relatedLeadIds`).
 */
export const inheritsLeadLink = (
    currentTask: EventTask | null | undefined,
): boolean => getTaskLinks(currentTask).leadIds.length > 0;

export const buildTaskLeadLinksView = ({
    currentTask,
    planActive,
    leads = [],
}: TaskLeadLinksInput): TaskLeadLinksView => {
    if (!planActive || inheritsLeadLink(currentTask)) {
        return { visible: false, candidates: [] };
    }

    const candidates = leads.filter(lead => isLeadOpen(lead.statusSemanticId));
    return { visible: candidates.length > 0, candidates };
};

/** Заявка с сайта отличима от обычного лида полями лидогена. */
const isRequest = (lead: RelatedLead): boolean =>
    Boolean(lead.questUrl || lead.regNumber);

/**
 * Что отметить по умолчанию: самая свежая ЗАЯВКА, а если заявок нет — самый
 * свежий открытый лид.
 *
 * Связь нужна почти всегда, и пустые чекбоксы менеджер чаще пролистывал, чем
 * отмечал — путь заявки при этом обрывался молча. Заявка приоритетнее лида:
 * именно её путь нужно продолжить, лид же обычно и есть та самая работа.
 */
export const pickDefaultLeadIds = (candidates: RelatedLead[]): number[] => {
    if (!candidates.length) return [];

    const byFreshness = [...candidates].sort((a, b) =>
        (b.dateCreate ?? '').localeCompare(a.dateCreate ?? ''),
    );
    const best = byFreshness.find(isRequest) ?? byFreshness[0];
    return best ? [best.id] : [];
};
