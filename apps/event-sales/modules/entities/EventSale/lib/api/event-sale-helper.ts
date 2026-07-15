import { getEventSalesSupport } from '@workspace/nest-event-sales-api';
import {
    EvSaleCompanyDealsDto,
    EvSaleCompanyDealsResponse,
    EvSaleNewTaskInitDto,
    EvSaleNewTaskInitResponse,
} from '../../model';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для сделок
 * (правило CLAUDE.md). Замена legacy PHP full/deals + full/newTask/init.
 */
export class EventSaleHelper {
    private api: ReturnType<typeof getEventSalesSupport>;

    constructor() {
        this.api = getEventSalesSupport();
    }

    /** Презентационные сделки по текущей задаче. */
    async getCompanyDeals(
        dto: EvSaleCompanyDealsDto,
    ): Promise<EvSaleCompanyDealsResponse> {
        return this.api.eventSupportGetCompanyDeals(dto);
    }

    /** Сделки для инициализации «новой задачи» (когда открытых задач нет). */
    async initNewTask(
        dto: EvSaleNewTaskInitDto,
    ): Promise<EvSaleNewTaskInitResponse> {
        return this.api.eventSupportInitNewTask(dto);
    }
}
