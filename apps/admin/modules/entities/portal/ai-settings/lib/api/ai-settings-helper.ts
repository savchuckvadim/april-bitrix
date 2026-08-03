import { getAdminPortalAiSettings } from '@workspace/nest-admin-api';
import type { PortalAiSettings, PortalAiSettingsUpdate } from '../../model';

/**
 * Единственное место с импортом сгенерированного `admin-portal-ai-settings`
 * клиента (паттерн portal-keys-helper).
 */
export class AiSettingsHelper {
    private api = getAdminPortalAiSettings();

    /** Настройки портала; незаданные поля приходят null (= глобальные). */
    get(portalId: number): Promise<PortalAiSettings> {
        return this.api.portalAiSettingsGet(portalId);
    }

    /** Частичное сохранение: явный null сбрасывает поле на глобальное. */
    save(
        portalId: number,
        update: PortalAiSettingsUpdate,
    ): Promise<PortalAiSettings> {
        return this.api.portalAiSettingsUpdate(portalId, update);
    }
}
