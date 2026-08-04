import type { RelatedCrmDetails, RelatedDeal, RelatedLead } from '../model';

/**
 * На чём висит дело — сделка или лид из уже загруженных связей клиента.
 *
 * Отдельного запроса на карточку дела не делаем: связи клиента уже в состоянии,
 * а привязки задачи — в ней самой. Остаётся сопоставить, и это чистая функция.
 */
export interface TaskRelation {
    deal: RelatedDeal | null;
    lead: RelatedLead | null;
}

export interface ResolveTaskRelationParams {
    details: RelatedCrmDetails | null;
    dealIds: number[];
    leadIds: number[];
}

export const resolveTaskRelation = ({
    details,
    dealIds,
    leadIds,
}: ResolveTaskRelationParams): TaskRelation => {
    if (!details) return { deal: null, lead: null };

    // Берём первую найденную: у дела бывает несколько привязок (основная сделка
    // плюс сделка-спутник), но на строке помещается одна — и полезнее та, что
    // реально есть в связях клиента.
    const deal =
        details.deals?.find(item => dealIds.includes(item.id)) ?? null;
    const lead = details.leads?.find(item => leadIds.includes(item.id)) ?? null;

    return { deal, lead };
};
