import {
    WordTemplateVisibility,
    type UpdateWordTemplateRequest,
    type WordTemplateSummary,
} from '@/modules/entities/offer-template-word';

/**
 * Привязка шаблона по видимости (перенос из старого окна настроек):
 * общедоступный — ни портала, ни автора; портала — только портал; свой —
 * портал и автор.
 */
export const toUpdatePayload = (
    data: UpdateWordTemplateRequest,
    editing: WordTemplateSummary,
    owner: { portalId: number | undefined; userId: number },
): UpdateWordTemplateRequest => {
    const visibility = (data.visibility ?? editing.visibility) as WordTemplateVisibility;
    if (visibility === WordTemplateVisibility.PUBLIC) {
        return { ...data, visibility, portal_id: undefined, user_id: undefined };
    }
    if (visibility === WordTemplateVisibility.PORTAL) {
        return { ...data, visibility, portal_id: owner.portalId, user_id: undefined };
    }
    return { ...data, visibility, portal_id: owner.portalId, user_id: owner.userId || undefined };
};
