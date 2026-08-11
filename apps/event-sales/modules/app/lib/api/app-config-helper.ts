import { getEventSalesAppSettings } from '@workspace/nest-event-sales-api';

/**
 * Единственное место импорта `@workspace/nest-event-sales-api` для
 * портальных настроек приложения (GET /app-settings/event-sales).
 */
export class AppConfigHelper {
    private api: ReturnType<typeof getEventSalesAppSettings>;

    constructor() {
        this.api = getEventSalesAppSettings();
    }

    /** Действующие настройки приложения «Звонки» на домене (ключ→значение). */
    async getEventSalesSettings(
        domain: string,
    ): Promise<Record<string, unknown>> {
        return this.api.appSettingsResolve('event-sales', { domain });
    }
}
