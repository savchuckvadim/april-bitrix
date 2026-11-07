import {
    getSalesAiAnalyticsAdmin,
    type AiOwnerReportExportStateDto,
} from '@workspace/nest-admin-api';

/** Период выгрузки: портал и месяц ГГГГ-ММ. */
export interface OwnerReportExportTarget {
    domain: string;
    periodKey: string;
}

const MONTH_KIND = 'month' as const;

/**
 * Единственное место импорта ручек выгрузки PDF отчёта собственнику
 * (`admin/ai-analytics/owner-report-export`): запуск, состояние, файл.
 */
export class OwnerReportExportHelper {
    private api = getSalesAiAnalyticsAdmin();

    start(
        target: OwnerReportExportTarget,
        forceRefresh: boolean,
    ): Promise<AiOwnerReportExportStateDto> {
        return this.api.aiAnalyticsOwnerReportExportAdminStart({
            domain: target.domain,
            kind: MONTH_KIND,
            periodKey: target.periodKey,
            forceRefresh,
        });
    }

    async state(
        target: OwnerReportExportTarget,
    ): Promise<AiOwnerReportExportStateDto | null> {
        const response = await this.api.aiAnalyticsOwnerReportExportAdminState({
            domain: target.domain,
            kind: MONTH_KIND,
            periodKey: target.periodKey,
        });
        return response.state ?? null;
    }

    file(target: OwnerReportExportTarget): Promise<Blob> {
        return this.api.aiAnalyticsOwnerReportExportAdminFile({
            domain: target.domain,
            kind: MONTH_KIND,
            periodKey: target.periodKey,
        });
    }
}
