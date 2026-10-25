import { getAppCache } from '@workspace/nest-konstructor-api';

/** Пространство центрального кэша настроек (`app_cache.app`) конструктора. */
const APP_CACHE_APP = 'konstructor';
const PROVIDER_KEY = 'document-provider';

type ProviderSetting = {
    providerId: string;
};

const isProviderSetting = (value: unknown): value is ProviderSetting =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ProviderSetting).providerId === 'string';

/**
 * Поставщик по умолчанию для пользователя — в центральном кэше настроек
 * (Redis + `app_cache`, ключ app + domain + bxUserId + key). Замена легаси
 * Laravel `konstructor/front/provider` (userId → agentId).
 */
export class ProviderSettingsHelper {
    private api = getAppCache();

    /** null — настройки нет (404) или она битая. */
    async readProviderId(domain: string, bxUserId: number): Promise<string | null> {
        try {
            const entry = await this.api.appCacheEntry({
                app: APP_CACHE_APP,
                domain,
                key: PROVIDER_KEY,
                bxUserId,
            });
            return isProviderSetting(entry.data) ? entry.data.providerId : null;
        } catch {
            return null;
        }
    }

    async writeProviderId(
        domain: string,
        bxUserId: number,
        providerId: string,
    ): Promise<void> {
        const data: ProviderSetting = { providerId };
        await this.api.appCacheSet({
            app: APP_CACHE_APP,
            domain,
            key: PROVIDER_KEY,
            bxUserId,
            data,
        });
    }
}
