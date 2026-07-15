import { getEventSales } from '@workspace/nest-event-sales-api';
import { EvFlowDto, EvFlowResponse } from '../../model';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для отправки.
 * Единая точка отправки отчёта: POST /api/event-sales/flow
 * (замена legacy PHP `full` и лид-ветки backAPI).
 */
export class FlowHelper {
    private api: ReturnType<typeof getEventSales>;

    constructor() {
        this.api = getEventSales();
    }

    async sendFlow(dto: EvFlowDto): Promise<EvFlowResponse> {
        return this.api.eventSalesGetFlow(dto);
    }
}
