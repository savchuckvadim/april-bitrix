/** Ссылки в Битрикс из записи дайджеста (домен портала — из стора). */

export const companyLink = (
    domain: string,
    companyId: number | null,
): string | null =>
    domain && companyId && companyId > 0
        ? `https://${domain}/crm/company/details/${companyId}/`
        : null;

export const listElementLink = (
    domain: string,
    listId: string,
    elementId: string,
): string | null =>
    domain && listId && elementId
        ? `https://${domain}/company/lists/${listId}/element/0/${elementId}/?list_section_id=`
        : null;

const DEAL_REF_RE = /^D_(\d+)$/;

export const dealLinkFromRefs = (
    domain: string,
    crmRefs: readonly string[],
): string | null => {
    for (const ref of crmRefs) {
        const match = DEAL_REF_RE.exec(ref);
        if (match && domain) return `https://${domain}/crm/deal/details/${match[1]}/`;
    }
    return null;
};
