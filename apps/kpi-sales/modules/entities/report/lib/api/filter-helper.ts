import {
    getSalesReportFilter,
    ReportFilterSaveRequestDto,
    SavedReportFilterDto,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Сохранённые фильтры отчёта — новый бэк kpi-report-sales
 * (замена legacy online API /report/settings/*).
 */
export class ReportFilterHelper {
    private api: ReturnType<typeof getSalesReportFilter>;

    constructor() {
        this.api = getSalesReportFilter();
    }

    async getSaved(
        domain: string,
        userId: number,
    ): Promise<SavedReportFilterDto | null> {
        const response = await this.api.reportSettingsGetFilter({
            domain,
            userId,
        });
        return response?.filter ?? null;
    }

    async save(dto: ReportFilterSaveRequestDto): Promise<void> {
        await this.api.reportSettingsSaveFilter(dto);
    }
}
