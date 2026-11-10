import type { ClientCard } from '@/modules/entities/client-card';

export interface ClientIdentityView {
    identity: { title: string; href: string | null; kindLabel: string };
    /** Сделка рядом с компанией; null — не показываем */
    deal: { label: string; href: string | null } | null;
}

const companyIdentity = (company: NonNullable<ClientCard['company']>) => ({
    title: company.title,
    href: company.href,
    kindLabel: 'Компания',
});

const dealIdentity = (deal: ClientCard['deal']) => ({
    title: deal?.label ?? 'Без сделки',
    href: deal?.href ?? null,
    kindLabel: 'Сделка',
});

/**
 * Кто в шапке. Большой экран — компания и сделка рядом. Вкладка карточки
 * (маленький экран) — только второй участник: из сделки — компания, из
 * компании — сделка; ту карточку, где открыт фрейм, менеджер и так видит.
 */
export const buildClientIdentity = (
    card: Pick<ClientCard, 'company' | 'deal'>,
    small: { isSmall: boolean; openedFrom: 'deal' | 'company' | null },
): ClientIdentityView => {
    if (small.isSmall && small.openedFrom === 'company') {
        return { identity: dealIdentity(card.deal), deal: null };
    }
    if (small.isSmall && small.openedFrom === 'deal' && card.company) {
        return { identity: companyIdentity(card.company), deal: null };
    }
    return card.company
        ? { identity: companyIdentity(card.company), deal: card.deal }
        : { identity: dealIdentity(card.deal), deal: null };
};
