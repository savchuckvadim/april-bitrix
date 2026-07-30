import {
    CallingStatisticResponseDto,
    getSalesReport,
    GetCallingStatisticDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Единственное место импорта клиента calling-statistic из api-пакета. */
export class CallingStatisticsHelper {
    private api: ReturnType<typeof getSalesReport>;

    constructor() {
        this.api = getSalesReport();
    }

    /**
     * Конверт очереди {status, data?, requestKey, message?}: ready — данные
     * готовы; queued — расчёт идёт (поллинг/WS
     * kpi-report:calling-statistic:done); error — расчёт упал.
     */
    async getStatistics(
        dto: GetCallingStatisticDto,
    ): Promise<CallingStatisticResponseDto> {
        return await this.api.kpiReportGetCallingStatistic(dto);
    }
}
