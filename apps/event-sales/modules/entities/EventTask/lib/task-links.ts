import type { EventTask } from '../types/event-task-type';

/**
 * CRM-привязки задачи.
 *
 * Битрикс хранит их строками вида `CO_123` (компания), `D_456` (сделка),
 * `L_789` (лид), `C_321` (контакт) в `ufCrmTask`. Задачи одного клиента могут
 * висеть на разных сделках — ХО, презентация, основная, — поэтому привязка у
 * каждой своя, и показывать её имеет смысл на карточке дела, а не один раз на
 * весь экран.
 *
 * Это ЕДИНСТВЕННЫЙ парсер `ufCrmTask` в приложении: локальные копии
 * (`getCompanyIdFromTask`, `getLeadIdByTaskUF`, инлайны в thunk'ах) сведены
 * сюда, чтобы `C_`/`CO_`-нюанс не расползался по коду.
 */
export interface TaskLinks {
    companyId: number | null;
    dealIds: number[];
    leadIds: number[];
    contactIds: number[];
}

/** Типы CRM-привязок задачи (as const — значения остаются литералами). */
export const ETaskLinkType = {
    COMPANY: 'company',
    DEAL: 'deal',
    LEAD: 'lead',
    CONTACT: 'contact',
} as const;

export type TaskLinkType = (typeof ETaskLinkType)[keyof typeof ETaskLinkType];

export interface TaskLinkRef {
    type: TaskLinkType;
    id: number;
}

const PREFIX = {
    company: 'CO_',
    deal: 'D_',
    lead: 'L_',
    contact: 'C_',
} as const;

const toId = (raw: string, prefix: string): number | null => {
    if (!raw.startsWith(prefix)) return null;
    const id = Number(raw.slice(prefix.length));
    return Number.isFinite(id) && id > 0 ? id : null;
};

/** Парсер сырого массива `UF_CRM_TASK` (когда EventTask ещё не построен). */
export const getCrmLinksFromRaw = (
    raw: string[] | null | undefined,
): TaskLinks => {
    const links: TaskLinks = {
        companyId: null,
        dealIds: [],
        leadIds: [],
        contactIds: [],
    };
    if (!Array.isArray(raw)) return links;

    raw.forEach(value => {
        if (typeof value !== 'string') return;
        // `CO_` проверяется раньше `C_`: у контакта тот же первый символ.
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
        if (leadId) {
            links.leadIds.push(leadId);
            return;
        }
        const contactId = toId(value, PREFIX.contact);
        if (contactId) links.contactIds.push(contactId);
    });

    return links;
};

export const getTaskLinks = (task: EventTask | null | undefined): TaskLinks =>
    getCrmLinksFromRaw(
        (task as unknown as { ufCrmTask?: string[] } | null)?.ufCrmTask,
    );

/** Все привязки задачи плоским списком (для счётчиков и группировок). */
export const getTaskLinkRefs = (links: TaskLinks): TaskLinkRef[] => {
    const refs: TaskLinkRef[] = [];
    if (links.companyId) {
        refs.push({ type: ETaskLinkType.COMPANY, id: links.companyId });
    }
    links.dealIds.forEach(id => refs.push({ type: ETaskLinkType.DEAL, id }));
    links.leadIds.forEach(id => refs.push({ type: ETaskLinkType.LEAD, id }));
    links.contactIds.forEach(id =>
        refs.push({ type: ETaskLinkType.CONTACT, id }),
    );
    return refs;
};
