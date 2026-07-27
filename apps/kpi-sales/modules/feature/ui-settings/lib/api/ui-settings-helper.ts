import {
    getSalesReportUiSettings,
    UiSettingsGetResponseDto,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Единственное место импорта generated-клиента ui-settings.
 * Блоб непрозрачен для бэка — сериализация/версии на фронте.
 */
export class UiSettingsHelper {
    private api: ReturnType<typeof getSalesReportUiSettings>;

    constructor() {
        this.api = getSalesReportUiSettings();
    }

    async get(
        domain: string,
        userId: number,
    ): Promise<UiSettingsGetResponseDto | null> {
        const response = await this.api.uiSettingsGetUiSettings({
            domain,
            userId,
        });
        return response ?? null;
    }

    async save(
        domain: string,
        userId: number,
        settings: string,
    ): Promise<void> {
        await this.api.uiSettingsSaveUiSettings({ domain, userId, settings });
    }
}
