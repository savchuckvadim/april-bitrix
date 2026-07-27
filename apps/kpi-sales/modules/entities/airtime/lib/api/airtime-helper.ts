import {
    getSalesAirtime,
    GetAirtimeStatisticDto,
} from '@workspace/nest-kpi-report-sales-api';
import type { AirtimeReport } from '../../model';

/**
 * Эфирное время (voximplant.statistic.get) — единственное место импорта
 * generated-клиента sales-airtime. Синхронный запрос, без кэша на бэке.
 */
export class AirtimeHelper {
    private api: ReturnType<typeof getSalesAirtime>;

    constructor() {
        this.api = getSalesAirtime();
    }

    async getStatistic(dto: GetAirtimeStatisticDto): Promise<AirtimeReport> {
        return await this.api.kpiAirtimeGetAirtimeStatistic(dto);
    }
}
