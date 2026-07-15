import { getEventSalesSupport } from '@workspace/nest-event-sales-api';
import type {
    CompanyHistoryRequestDto,
    HistoryItemDto,
} from '@workspace/nest-event-sales-api';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для истории.
 * Замена legacy PHP flow-front/history (пока стаб на бэке).
 */
export class HistoryHelper {
    private api: ReturnType<typeof getEventSalesSupport>;

    constructor() {
        this.api = getEventSalesSupport();
    }

    async getCompanyHistory(
        dto: CompanyHistoryRequestDto,
    ): Promise<HistoryItemDto[]> {
        return this.api.eventSupportGetCompanyHistory(dto);
    }
}
