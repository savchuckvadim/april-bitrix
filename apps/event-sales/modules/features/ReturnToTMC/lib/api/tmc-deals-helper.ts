import { getEventSalesSupport } from '@workspace/nest-event-sales-api';
import type {
    TmcDealForReturnDto,
    TmcDealsRequestDto,
} from '@workspace/nest-event-sales-api';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для ТМЦ-сделок.
 * Замена legacy PHP full/pres/tmcdeals (пока стаб на бэке).
 */
export class TmcDealsHelper {
    private api: ReturnType<typeof getEventSalesSupport>;

    constructor() {
        this.api = getEventSalesSupport();
    }

    async getTmcDeals(dto: TmcDealsRequestDto): Promise<TmcDealForReturnDto[]> {
        return this.api.eventSupportGetTmcDeals(dto);
    }
}
