import { getSalesReport } from '@workspace/nest-kpi-report-sales-api';
import type { DigestRequest, DigestResponse } from '../../model';

/**
 * Дневной дайджест — единственное место импорта generated-клиента
 * (POST /api/kpi-report/digest/get, тег «Sales Report»). Конверт
 * ready|queued|error: при queued результат приходит по WS
 * kpi-report:digest:done на socketId запроса либо повторным POST.
 */
export class DigestHelper {
    private api: ReturnType<typeof getSalesReport>;

    constructor() {
        this.api = getSalesReport();
    }

    async get(dto: DigestRequest): Promise<DigestResponse> {
        return await this.api.kpiDigestGetDigest(dto);
    }
}
