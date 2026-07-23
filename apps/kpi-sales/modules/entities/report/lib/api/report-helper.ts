import {
    getSalesReport,
    ReportGetRequestDto,
} from '@workspace/nest-kpi-report-sales-api';
import { ReportData } from '../../model/types/report/report-type';

/** Единственное место импорта клиента kpi-report из api-пакета. */
export class ReportHelper {
    private api: ReturnType<typeof getSalesReport>;

    constructor() {
        this.api = getSalesReport();
    }

    async getReport(dto: ReportGetRequestDto): Promise<ReportData[] | null> {
        return (await this.api.kpiReportGetReport(
            dto,
        )) as unknown as ReportData[] | null;
    }
}
