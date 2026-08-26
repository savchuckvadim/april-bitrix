import { getEventSales } from '@workspace/nest-event-sales-api';
import type { StagePredictRequest, StagePredictResult } from '../../model';

/**
 * Единственное место импорта generated-клиента для предикта стадии.
 * POST /event-sales/stage-predict — лёгкий запрос (1 REST-вызов к Битриксу
 * на бэке, Redis-кэш) — зовётся на смену статуса/типа плана.
 */
export class StagePredictHelper {
    private api: ReturnType<typeof getEventSales>;

    constructor() {
        this.api = getEventSales();
    }

    async predict(request: StagePredictRequest): Promise<StagePredictResult> {
        return this.api.eventSalesGetStagePredict(request);
    }
}
