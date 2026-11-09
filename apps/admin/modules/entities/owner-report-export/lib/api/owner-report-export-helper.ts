import {
    getSalesAiAnalyticsAdmin,
    type AiOwnerReportExportStateDto,
} from '@workspace/nest-admin-api';
import type { OwnerReportExportKind } from '../owner-report-periods';

/** Период выгрузки: портал, вид периода и его ключ (ГГГГ-ММ, ГГГГ-Q1, ГГГГ-H1, ГГГГ). */
export interface OwnerReportExportTarget {
    domain: string;
    kind: OwnerReportExportKind;
    periodKey: string;
}

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
            ...target,
            forceRefresh,
        });
    }

    async state(
        target: OwnerReportExportTarget,
    ): Promise<AiOwnerReportExportStateDto | null> {
        const response =
            await this.api.aiAnalyticsOwnerReportExportAdminState(target);
        return response.state ?? null;
    }

    file(target: OwnerReportExportTarget): Promise<Blob> {
        return this.api.aiAnalyticsOwnerReportExportAdminFile(target);
    }
}
