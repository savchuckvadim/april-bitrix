/** Ключ localStorage для черновика комментария (по контексту компании/лида). */
export const getCommentKey = (
    domain: string,
    isLeadContext: boolean,
    leadId: number | string | null | undefined,
    companyId: number | string | null | undefined,
    userId: number | string | null | undefined,
): string => {
    const entityPart = isLeadContext ? `lead_${leadId ?? 0}` : `co_${companyId ?? 0}`;
    return `${domain}_${entityPart}_${userId ?? 0}_comment`;
};
