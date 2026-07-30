import {
    getSalesReport,
    KpiReportGetResponseDto,
    ReportGetRequestDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Единственное место импорта клиента kpi-report из api-пакета. */
export class ReportHelper {
    private api: ReturnType<typeof getSalesReport>;

    constructor() {
        this.api = getSalesReport();
    }

    /**
     * Конверт очереди {status, data?, requestKey, message?}: ready — данные
     * готовы; queued — расчёт идёт (поллинг/WS kpi-report:done); error —
     * расчёт упал.
     */
    async getReport(
        dto: ReportGetRequestDto,
    ): Promise<KpiReportGetResponseDto> {
        return await this.api.kpiReportGetReport(dto);
    }
}
