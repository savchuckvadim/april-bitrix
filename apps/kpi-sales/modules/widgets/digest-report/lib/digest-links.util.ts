/** Ссылки в Битрикс из записей дайджеста (домен портала — из стора). */

export type CrmEntityKind = 'company' | 'contact' | 'lead' | 'deal';

const CRM_PATH: Record<CrmEntityKind, string> = {
    company: 'company',
    contact: 'contact',
    lead: 'lead',
    deal: 'deal',
};

/** Карточка сущности CRM; нет домена или id — null. */
export const crmLink = (
    domain: string,
    kind: CrmEntityKind,
    id: number | null | undefined,
): string | null =>
    domain && id && id > 0 ? `https://${domain}/crm/${CRM_PATH[kind]}/details/${id}/` : null;

export const companyLink = (domain: string, companyId: number | null): string | null =>
    crmLink(domain, 'company', companyId);

export const listElementLink = (
    domain: string,
    listId: string,
    elementId: string,
): string | null =>
    domain && listId && elementId
        ? `https://${domain}/company/lists/${listId}/element/0/${elementId}/?list_section_id=`
        : null;
