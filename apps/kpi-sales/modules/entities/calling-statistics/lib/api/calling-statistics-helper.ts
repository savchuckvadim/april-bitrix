import {
    getSalesReport,
    GetCallingStatisticDto,
} from '@workspace/nest-kpi-report-sales-api';
import { ReportCallingData } from '../../type/calling-type';

/** Единственное место импорта клиента calling-statistic из api-пакета. */
export class CallingStatisticsHelper {
    private api: ReturnType<typeof getSalesReport>;

    constructor() {
        this.api = getSalesReport();
    }

    async getStatistics(
        dto: GetCallingStatisticDto,
    ): Promise<ReportCallingData[] | null> {
        return (await this.api.kpiReportGetCallingStatistic(
            dto,
        )) as unknown as ReportCallingData[] | null;
    }
}
