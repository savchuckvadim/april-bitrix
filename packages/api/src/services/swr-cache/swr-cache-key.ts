import type { SwrCacheKey } from './swr-cache.type';

/**
 * Префикс всех записей утилиты.
 *
 * Намеренно не пересекается с легаси-префиксами (`portal_cache`,
 * `provider_cache`, …): старая чистка `removeOldPortalCache(prefix)` метёт по
 * `key.startsWith(prefix)` и не должна дотягиваться до новых записей.
 */
export const SWR_CACHE_KEY_PREFIX = 'swrc';

/** Секрет-заглушка на случай пустого домена — как в легаси `local-encrypt`. */
export const SWR_FALLBACK_SECRET = 'nmbrsdntl';

/** Сутки в миллисекундах — шаг «раз в день перезапрашиваем по тихому». */
export const SWR_DAY_MS = 24 * 60 * 60 * 1000;

/** По умолчанию запись живёт сутки, дальше обновляется в фоне. */
export const SWR_DEFAULT_STALE_AFTER_MS = SWR_DAY_MS;

/** Предельный возраст записи: старше 30 дней — мертва, к отдаче не годна. */
export const SWR_DEFAULT_MAX_AGE_MS = 30 * SWR_DAY_MS;

/** Потолок ожидания сети — зависший запрос не должен висеть вечно. */
export const SWR_DEFAULT_TIMEOUT_MS = 15_000;

/** Собирает ключ: имя + домен + версия схемы, ничего лишнего. */
export const buildSwrCacheKey = (key: SwrCacheKey): SwrCacheKey => ({
    name: key.name,
    domain: key.domain,
    version: key.version,
});

/**
 * Строковое представление ключа: `swrc:v1:portal:garant.bitrix24.ru`.
 * Домен и имя кодируются — двоеточие в них не сломает разбор.
 */
export const swrCacheKeyToString = (key: SwrCacheKey): string =>
    [
        SWR_CACHE_KEY_PREFIX,
        `v${key.version}`,
        encodeURIComponent(key.name),
        encodeURIComponent(key.domain),
    ].join(':');

/** Разбор строкового ключа обратно в структуру. `null` — ключ не наш. */
export const parseSwrCacheKeyString = (raw: string): SwrCacheKey | null => {
    const parts = raw.split(':');

    if (parts.length !== 4 || parts[0] !== SWR_CACHE_KEY_PREFIX) {
        return null;
    }

    const version = Number((parts[1] ?? '').replace(/^v/, ''));

    if (!Number.isInteger(version) || version < 1) {
        return null;
    }

    try {
        return {
            version,
            name: decodeURIComponent(parts[2] ?? ''),
            domain: decodeURIComponent(parts[3] ?? ''),
        };
    } catch {
        return null;
    }
};

/** Секрет шифрования записи — домен портала, как в легаси-утилите. */
export const getSwrCacheSecret = (key: SwrCacheKey): string =>
    key.domain || SWR_FALLBACK_SECRET;
