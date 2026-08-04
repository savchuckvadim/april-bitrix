import type { BXCompany, BXDeal, BXLead } from '@workspace/bx';
import { APP_FROM_ENUM } from '@/modules/app/model/slice/AppSlice';
import { RELATED_ENTITY_TYPE, type RelatedEntityType } from '../model';

/**
 * Кто мы и на чём открыты.
 *
 * Экран одинаков для любой встройки, но заголовок и то, у кого спрашивать
 * связанные сущности, зависят от того, откуда пришли. Здесь это решается
 * один раз и чистой функцией — компоненты уже получают готовое.
 */
export interface EntityDescriptor {
    /** Для кого запрашиваем связанные сделки и лиды. */
    entityType: RelatedEntityType;
    entityId: number;
    /** Человеческое имя типа: «Компания», «Лид», «Сделка». */
    kindLabel: string;
    /** Название сущности в шапке. */
    title: string;
    /**
     * Сделка, из которой открылись, если открылись из сделки. Нужна, чтобы
     * подсветить её в списке связанных: «вот эта — та, что перед тобой».
     */
    currentDealId: number | null;
    /** Компания найдена — значит можно искать дубли и историю по ней. */
    companyId: number | null;
}

export interface EntityDescriptorInput {
    from: APP_FROM_ENUM | null;
    company: BXCompany | null;
    deal: BXDeal | null;
    lead: BXLead | null;
}

const toId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

export const getEntityDescriptor = ({
    from,
    company,
    deal,
    lead,
}: EntityDescriptorInput): EntityDescriptor | null => {
    const companyId = toId(company?.ID);
    const dealId = toId(deal?.ID);
    const leadId = toId(lead?.ID);

    // Компания — самый широкий контекст: у неё видны все сделки и лиды сразу.
    // Поэтому если она известна, спрашиваем связанные сущности у неё, даже
    // когда открылись из сделки: иначе менеджер увидит одну сделку вместо
    // всей картины по клиенту.
    if (companyId) {
        return {
            entityType: RELATED_ENTITY_TYPE.COMPANY,
            entityId: companyId,
            kindLabel: 'Компания',
            title: company?.TITLE?.trim() || `Компания ${companyId}`,
            currentDealId: dealId,
            companyId,
        };
    }

    // Лид без компании — работаем с самим лидом (так открывается холодная база).
    if (leadId) {
        return {
            entityType: RELATED_ENTITY_TYPE.LEAD,
            entityId: leadId,
            kindLabel: 'Лид',
            title: lead?.TITLE?.trim() || `Лид ${leadId}`,
            currentDealId: null,
            companyId: null,
        };
    }

    // Сделка без компании — редкий, но реальный случай.
    if (dealId) {
        return {
            entityType: RELATED_ENTITY_TYPE.DEAL,
            entityId: dealId,
            kindLabel: 'Сделка',
            title: deal?.TITLE?.trim() || `Сделка ${dealId}`,
            currentDealId: dealId,
            companyId: null,
        };
    }

    // Ни одной сущности — показывать нечего, и врать бейджем не будем.
    void from;
    return null;
};
