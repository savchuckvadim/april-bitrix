/**
 * Кэш «отдай старое, обнови в фоне» для почти неизменных слепков.
 *
 * Хранилище выбирается само: IndexedDB → localStorage → сквозной режим
 * (нет ни того, ни другого — просто всегда идём в сеть, ничего не роняя).
 * Значение шифруется доменом портала, домен и версия схемы входят в ключ.
 *
 * ```ts
 * const { value, source } = await swrCache.resolve<Portal>({
 *     key: { name: 'portal', domain, version: 1 },
 *     staleAfterMs: SWR_DAY_MS,
 *     fetcher: async ({ signal }) => loadPortal(domain, signal),
 *     onUpdate: portal => dispatch(portalActions.setPortal({ portal })),
 * });
 * ```
 *
 * `resolve` возвращается сразу, как только есть что отдать; фоновое
 * обновление живёт своей жизнью и при неудаче оставляет прежнее значение.
 */
export {
    swrCache,
    readSwrCache,
    writeSwrCache,
    expireSwrCache,
    removeSwrCache,
    resolveSwrCache,
    cleanupSwrCache,
    resetSwrCacheRuntime,
    SwrTimeoutError,
} from './swr-cache';

export {
    buildSwrCacheKey,
    swrCacheKeyToString,
    parseSwrCacheKeyString,
    SWR_CACHE_KEY_PREFIX,
    SWR_DAY_MS,
    SWR_DEFAULT_STALE_AFTER_MS,
    SWR_DEFAULT_MAX_AGE_MS,
    SWR_DEFAULT_TIMEOUT_MS,
} from './swr-cache-key';

export { getSwrStorageKind } from './swr-cache-storage';

export type {
    SwrCacheEntry,
    SwrCacheKey,
    SwrFetchContext,
    SwrFetcher,
    SwrReadOptions,
    SwrResolveOptions,
    SwrResolveResult,
    SwrRevalidateOutcome,
    SwrStorageKind,
    SwrValueSource,
    SwrWriteOptions,
} from './swr-cache.type';
