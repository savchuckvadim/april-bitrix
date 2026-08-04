import { getEventSales } from '@workspace/nest-event-sales-api';
import { EvFlowDto, EvFlowOperation } from '../../model';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для отправки.
 * Единая точка отправки отчёта: POST /api/event-sales/flow
 * (замена legacy PHP `full` и лид-ветки backAPI).
 *
 * Отправка асинхронная: POST только ставит операцию в очередь и возвращает её
 * статус, а исход узнаётся отдельным запросом (`getFlowStatus`).
 */
export class FlowHelper {
    private api: ReturnType<typeof getEventSales>;

    constructor() {
        this.api = getEventSales();
    }

    /** Принять отчёт в обработку. Повтор с тем же operationId безопасен. */
    async sendFlow(dto: EvFlowDto): Promise<EvFlowOperation> {
        return this.api.eventSalesGetFlow(dto);
    }

    /** Текущее состояние операции. Живёт час после завершения. */
    async getFlowStatus(
        operationId: string,
        domain: string,
    ): Promise<EvFlowOperation> {
        return this.api.eventSalesGetFlowStatus(operationId, { domain });
    }
}
