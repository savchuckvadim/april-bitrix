import { getAppCache } from '@workspace/nest-konstructor-api';
import type { CompositionViewSettings } from '../../model/types';
import { parseCompositionView } from '../composition-view.util';

/** Пространство центрального кэша настроек (`app_cache.app`) конструктора. */
const APP_CACHE_APP = 'konstructor';
const VIEW_KEY = 'composition-view';

/**
 * Вид наполнения пользователя — в центральном кэше настроек (ключ app + domain
 * + bxUserId + key): выбор переезжает с менеджером на другой компьютер.
 */
export class CompositionViewHelper {
    private api = getAppCache();

    /** null — настройки нет (404) или она битая. */
    async read(domain: string, bxUserId: number): Promise<CompositionViewSettings | null> {
        try {
            const entry = await this.api.appCacheEntry({
                app: APP_CACHE_APP,
                domain,
                key: VIEW_KEY,
                bxUserId,
            });
            return parseCompositionView(entry.data);
        } catch {
            return null;
        }
    }

    async write(domain: string, bxUserId: number, data: CompositionViewSettings): Promise<void> {
        await this.api.appCacheSet({
            app: APP_CACHE_APP,
            domain,
            key: VIEW_KEY,
            bxUserId,
            data: { ...data },
        });
    }
}
