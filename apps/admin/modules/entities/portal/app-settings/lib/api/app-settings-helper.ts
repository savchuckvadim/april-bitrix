import { getAdminPortalAppSettings } from '@workspace/nest-admin-api';
import type {
    PortalAppCode,
    PortalAppSettingsResponse,
    PortalAppSettingValue,
} from '../../model';

/**
 * Единственное место импорта `@workspace/nest-admin-api` для настроек
 * приложений портала (GET/POST admin/portal/:id/app-settings).
 */
export class AppSettingsHelper {
    private api: ReturnType<typeof getAdminPortalAppSettings>;

    constructor() {
        this.api = getAdminPortalAppSettings();
    }

    async list(portalId: number): Promise<PortalAppSettingsResponse> {
        return this.api.portalAppSettingsList(portalId);
    }

    async save(
        portalId: number,
        appCode: PortalAppCode,
        values: Record<string, PortalAppSettingValue>,
    ): Promise<unknown> {
        return this.api.portalAppSettingsSave(portalId, appCode, { values });
    }
}
