import { Bitrix } from '@bitrix/bitrix';
import type { PresentationDeal } from '../../model/types';
import { toPresentationDeals, type PresentationDealsQuery } from '../presentation-deals.util';

/**
 * Сделки презентации через типизированный `deal.getList` пакета
 * `@workspace/bitrix`. Презентаций у одной основной сделки единицы, они
 * умещаются в одну страницу ответа Битрикса.
 */
export class PresentationDealsHelper {
    async list(query: PresentationDealsQuery): Promise<PresentationDeal[]> {
        const response = await Bitrix.getService().deal.getList(query.filter, query.select, query.order);
        return toPresentationDeals(response?.result ?? []);
    }
}
