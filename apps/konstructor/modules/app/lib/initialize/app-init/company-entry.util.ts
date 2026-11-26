import {
    getSalesFunnelScope,
    loadPortalSnapshot,
    type SalesFunnelScope,
} from '@/modules/entities/portal';
import { listOpenCompanyDeals } from '../../services/bx-company-entry.service';
import { pickCompanyDeal } from './placement-entity.util';

/**
 * Воронка «ОП Основная» из слепка портала. Слепок идёт тем же swrCache, что и
 * initPortal после setAppData, поэтому второй раз он берётся уже из кэша.
 * Слепок не загрузился или воронки на портале нет — null.
 */
export const loadSalesFunnel = async (
    domain: string,
): Promise<SalesFunnelScope | null> => {
    try {
        const { value: portal } = await loadPortalSnapshot(domain);
        return getSalesFunnelScope(portal);
    } catch (error) {
        console.warn('app-init: слепок портала недоступен', error);
        return null;
    }
};

/**
 * Вход из карточки компании: открытая сделка «ОП Основная» (самая свежая из
 * нескольких), ответственный не важен. null — подходящей сделки нет, и
 * конструктор работает на компании без сделки.
 *
 * Слепок портала запрашивается у нашего бэка, ему нужен токен сессии портала:
 * поэтому сначала ждём `sessionReady`.
 */
export const resolveCompanyDealId = async (
    companyId: number,
    domain: string,
    sessionReady: Promise<unknown>,
): Promise<number | null> => {
    await sessionReady;
    const funnel = await loadSalesFunnel(domain);
    if (!funnel) return null;
    const deals = await listOpenCompanyDeals(companyId, funnel.categoryId);
    const deal = pickCompanyDeal(deals, funnel);
    return deal ? Number(deal.ID) : null;
};
