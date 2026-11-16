import { getAppCache } from '@workspace/nest-konstructor-api';
import type { OfferPdfStylePrefs } from '../../model/types';
import { normalizeOfferPdfStyle } from '../offer-pdf-storage';

/** Пространство центрального кэша настроек (`app_cache.app`) конструктора. */
const APP_CACHE_APP = 'konstructor';
const PREFS_KEY = 'offer-pdf';

/**
 * Последний выбор менеджера для КП (формат, стиль, гамма, настройки) — в
 * центральном кэше настроек (app + domain + bxUserId + key): новая сделка
 * открывается так, как он печатал в прошлый раз, на любом компьютере.
 */
export class OfferPdfPrefsHelper {
    private api = getAppCache();

    /** null — настройки нет (404) или сервер недоступен. */
    async read(domain: string, bxUserId: number): Promise<OfferPdfStylePrefs | null> {
        try {
            const entry = await this.api.appCacheEntry({
                app: APP_CACHE_APP,
                domain,
                key: PREFS_KEY,
                bxUserId,
            });
            return entry.data ? normalizeOfferPdfStyle(entry.data) : null;
        } catch {
            return null;
        }
    }

    async write(domain: string, bxUserId: number, style: OfferPdfStylePrefs): Promise<void> {
        await this.api.appCacheSet({
            app: APP_CACHE_APP,
            domain,
            key: PREFS_KEY,
            bxUserId,
            data: { ...style, settings: { ...style.settings } },
        });
    }
}
