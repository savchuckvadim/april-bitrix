import type { IBXDeal } from '@bitrix/index';

/** Структурный минимум placement (Placement | CustomPlacement из @workspace/bx). */
export interface PlacementLike {
    placement: string;
    options: unknown;
}

/** Из какой карточки открыт конструктор. */
export type PlacementEntity =
    | { kind: 'deal'; id: number }
    | { kind: 'company'; id: number }
    | null;

const readId = (options: Record<string, unknown>): number | null => {
    const raw =
        'ID' in options ? options.ID : 'dealId' in options ? options.dealId : null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
};

/**
 * Сущность placement: сделка (CRM_DEAL_*) или компания (CRM_COMPANY_*).
 * Из компании конструктор сам находит её сделку (решение владельца 5).
 */
export const resolvePlacementEntity = (
    placement: PlacementLike | null,
): PlacementEntity => {
    if (!placement?.options || typeof placement.options !== 'object') return null;
    const code = String(placement.placement || '');
    const id = readId(placement.options as Record<string, unknown>);
    if (!id) return null;
    if (code.includes('DEAL')) return { kind: 'deal', id };
    if (code.includes('COMPANY')) return { kind: 'company', id };
    return null;
};

const createdAt = (deal: IBXDeal): number => {
    const time = Date.parse(String(deal.DATE_CREATE ?? ''));
    return Number.isFinite(time) ? time : 0;
};

const isOpen = (deal: IBXDeal): boolean => deal.CLOSED !== 'Y';

/**
 * Сделка компании для входа из карточки компании: открытая и самая свежая;
 * открытых нет — самая свежая из закрытых; сделок нет — null.
 */
export const pickCompanyDeal = (deals: IBXDeal[]): IBXDeal | null => {
    if (!deals.length) return null;
    const byFreshness = [...deals].sort((a, b) => createdAt(b) - createdAt(a));
    return byFreshness.find(isOpen) ?? byFreshness[0] ?? null;
};

/** Поля сделки, которых достаточно для выбора (список по COMPANY_ID). */
export const COMPANY_DEAL_SELECT = [
    'ID',
    'TITLE',
    'CLOSED',
    'DATE_CREATE',
    'COMPANY_ID',
    'CATEGORY_ID',
    'STAGE_ID',
];
