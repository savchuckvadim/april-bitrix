import {
    getAdminPortalAiProviders,
    getAdminPortalAiSettings,
} from '@workspace/nest-admin-api';
import type {
    PortalAiProvidersReadiness,
    PortalAiSettings,
    PortalAiSettingsUpdate,
} from '../../model';

/**
 * Единственное место с импортом сгенерированных клиентов
 * `admin-portal-ai-settings` и `admin-portal-ai-providers` (паттерн
 * portal-keys-helper).
 */
export class AiSettingsHelper {
    private api = getAdminPortalAiSettings();
    private providersApi = getAdminPortalAiProviders();

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

    /**
     * Чек-лист провайдеров: кто настроен, чей ключ, пойдёт ли через прокси.
     * `probe` — ещё и живая проверка endpoint'ов (GET /models), на секунды дольше.
     */
    readiness(
        portalId: number,
        probe: boolean,
    ): Promise<PortalAiProvidersReadiness> {
        return this.providersApi.portalAiProvidersReadiness(portalId, {
            probe,
        });
    }
}
