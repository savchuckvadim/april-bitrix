import type { EventTask } from '../types/event-task-type';

/**
 * CRM-привязки задачи.
 *
 * Битрикс хранит их строками вида `CO_123` (компания), `D_456` (сделка),
 * `L_789` (лид) в `ufCrmTask`. Задачи одного клиента могут висеть на разных
 * сделках — ХО, презентация, основная, — поэтому привязка у каждой своя, и
 * показывать её имеет смысл на карточке дела, а не один раз на весь экран.
 */
export interface TaskLinks {
    companyId: number | null;
    dealIds: number[];
    leadIds: number[];
}

const PREFIX = {
    company: 'CO_',
    deal: 'D_',
    lead: 'L_',
} as const;

const toId = (raw: string, prefix: string): number | null => {
    if (!raw.startsWith(prefix)) return null;
    const id = Number(raw.slice(prefix.length));
    return Number.isFinite(id) && id > 0 ? id : null;
};

export const getTaskLinks = (task: EventTask | null | undefined): TaskLinks => {
    const raw = (task as unknown as { ufCrmTask?: string[] } | null)?.ufCrmTask;
    const links: TaskLinks = { companyId: null, dealIds: [], leadIds: [] };
    if (!Array.isArray(raw)) return links;

    raw.forEach(value => {
        const companyId = toId(value, PREFIX.company);
        if (companyId) {
            links.companyId = companyId;
            return;
        }
        const dealId = toId(value, PREFIX.deal);
        if (dealId) {
            links.dealIds.push(dealId);
            return;
        }
        const leadId = toId(value, PREFIX.lead);
        if (leadId) links.leadIds.push(leadId);
    });

    return links;
};
