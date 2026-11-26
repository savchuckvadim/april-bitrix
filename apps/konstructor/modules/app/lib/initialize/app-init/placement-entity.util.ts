import type { IBXDeal } from '@bitrix/index';
import type { SalesFunnelScope } from '@/modules/entities/portal';

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
 * Лид и всё остальное — null: из них конструктор не открывается.
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

/**
 * Открытая сделка «ОП Основная»: воронка sales_base, не закрыта (успех, провал,
 * «Не состоялась» и «Не ЦА» закрывают сделку), семантика стадии «в работе» и
 * стадия не из финальных. Ответственный не важен.
 */
const isOpenSalesDeal = (deal: IBXDeal, funnel: SalesFunnelScope): boolean =>
    Number(deal.CATEGORY_ID ?? 0) === funnel.categoryId &&
    deal.CLOSED !== 'Y' &&
    String(deal.STAGE_SEMANTIC_ID ?? 'P') === 'P' &&
    !funnel.finalStageIds.has(String(deal.STAGE_ID));

/**
 * Сделка компании для входа из её карточки: открытая сделка воронки sales_base,
 * из нескольких — самая свежая. Подходящей нет (или воронка портала неизвестна) —
 * null: конструктор работает на компании без сделки.
 */
export const pickCompanyDeal = (
    deals: IBXDeal[],
    funnel: SalesFunnelScope | null,
): IBXDeal | null => {
    if (!funnel) return null;
    return (
        deals
            .filter(deal => isOpenSalesDeal(deal, funnel))
            .sort((a, b) => createdAt(b) - createdAt(a))[0] ?? null
    );
};
