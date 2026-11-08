import {
    getSalesAiAnalyticsAdmin,
    type AiRefreshPortalStateDto,
    type AiRefreshPortalsDto,
    type AiRefreshStartAllResultDto,
    type AiRefreshStartResultDto,
} from '@workspace/nest-admin-api';

/** Что запустить: месяц (нет — последний закрытый) и переразбор. */
export interface AiRefreshStartInput {
    monthKey?: string;
    withReanalysis: boolean;
}

/**
 * Единственное место импорта ручек «обновить всё по порядку»
 * (`Sales AI Analytics Admin`, `/api/admin/ai-analytics/refresh*`).
 */
export class AiRefreshHelper {
    private api = getSalesAiAnalyticsAdmin();

    start(
        domain: string,
        input: AiRefreshStartInput,
    ): Promise<AiRefreshStartResultDto> {
        return this.api.aiAnalyticsRefreshAdminStart({ domain, ...input });
    }

    state(domain: string): Promise<AiRefreshPortalStateDto> {
        return this.api.aiAnalyticsRefreshAdminState({ domain });
    }

    portals(): Promise<AiRefreshPortalsDto> {
        return this.api.aiAnalyticsRefreshAdminPortals();
    }

    startAll(input: AiRefreshStartInput): Promise<AiRefreshStartAllResultDto> {
        return this.api.aiAnalyticsRefreshAdminStartAll(input);
    }
}
