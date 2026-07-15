import { getEventSalesSupport } from '@workspace/nest-event-sales-api';
import type {
    CallResultsDto,
    ResultCountRequestDto,
} from '@workspace/nest-event-sales-api';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для счётчиков.
 * Замена legacy PHP flow-front/result/count (пока стаб на бэке).
 */
export class ResultCountHelper {
    private api: ReturnType<typeof getEventSalesSupport>;

    constructor() {
        this.api = getEventSalesSupport();
    }

    async getResultCount(dto: ResultCountRequestDto): Promise<CallResultsDto> {
        return this.api.eventSupportGetResultCount(dto);
    }
}
