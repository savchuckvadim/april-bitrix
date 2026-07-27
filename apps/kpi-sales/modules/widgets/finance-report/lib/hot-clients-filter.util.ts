import type { FinanceHotDeal } from '@/modules/entities/finance';
import { OfferFilter, PERSPECTIVE_ALL, STAGE_ALL } from './hot-clients.data';

export interface HotClientsFilterState {
    perspective: string;
    stage: string;
    offer: OfferFilter;
}

/** Встреченные в наборе цвета перспективы компании (для чипов-фильтра). */
export const collectPerspectiveColors = (
    deals: FinanceHotDeal[],
): string[] => {
    const set = new Set<string>();
    deals.forEach(deal => {
        if (deal.companyColor) set.add(deal.companyColor);
    });
    return [...set];
};

/** Встреченные в наборе стадии `{ code, name }` (для чипов-фильтра). */
export const collectStages = (
    deals: FinanceHotDeal[],
): { code: string; name: string }[] => {
    const map = new Map<string, string>();
    deals.forEach(deal => {
        if (deal.stageCode) {
            map.set(deal.stageCode, deal.stageName || deal.stageCode);
        }
    });
    return [...map.entries()].map(([code, name]) => ({ code, name }));
};

/** Клиентская фильтрация сделок по перспективе, стадии и наличию предложения. */
export const filterHotDeals = (
    deals: FinanceHotDeal[],
    { perspective, stage, offer }: HotClientsFilterState,
): FinanceHotDeal[] =>
    deals.filter(deal => {
        if (perspective !== PERSPECTIVE_ALL && deal.companyColor !== perspective) {
            return false;
        }
        if (stage !== STAGE_ALL && deal.stageCode !== stage) {
            return false;
        }
        if (offer === 'with' && !(deal.productRowsAmount > 0)) return false;
        if (offer === 'without' && deal.productRowsAmount > 0) return false;
        return true;
    });

/** Активен ли хоть один клиентский фильтр (для подписи «показано N из M»). */
export const isHotFilterActive = ({
    perspective,
    stage,
    offer,
}: HotClientsFilterState): boolean =>
    perspective !== PERSPECTIVE_ALL || stage !== STAGE_ALL || offer !== 'all';
