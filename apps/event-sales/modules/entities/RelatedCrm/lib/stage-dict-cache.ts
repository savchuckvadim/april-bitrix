import { expireSwrCache } from '@workspace/api';
import type { SwrCacheKey } from '@workspace/api';
import type { StageDictItem } from './bound-deal-view';

/**
 * Браузерный кэш словарей стадий воронок (`crm.status.list`).
 *
 * Зачем: словарь нужен полоскам стадий на каждом открытии фрейма, а фрейм
 * открывают на каждый звонок — без кэша это 1–3 прямых запроса в Битрикс
 * с офисного адреса на каждое открытие (разбор нагрузки 05.10.2026).
 * Воронки меняют считаные разы в год, поэтому словарь живёт сутки и
 * обновляется тихо в фоне; кнопка ⟳ помечает его устаревшим.
 */
const STAGE_DICT_CACHE_NAME = 'event-sales:stage-dict';

/** Версия схемы значения: поднимать при смене формы `StageDictItem`. */
export const STAGE_DICT_CACHE_VERSION = 1;

/** Сутки свежести — как у слепка портала. */
export const STAGE_DICT_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/** Ключ записи: воронка (ENTITY_ID справочника) + домен + версия схемы. */
export const getStageDictCacheKey = (
    domain: string,
    entityId: string,
): SwrCacheKey => ({
    name: `${STAGE_DICT_CACHE_NAME}:${entityId}`,
    domain,
    version: STAGE_DICT_CACHE_VERSION,
});

const isStageDictItem = (value: unknown): value is StageDictItem => {
    if (!value || typeof value !== 'object') return false;
    const item = value as Record<string, unknown>;
    return typeof item.statusId === 'string' && typeof item.name === 'string';
};

/**
 * В кэш ложится только НЕПУСТОЙ словарь: пустой ответ (портал не ответил,
 * воронку удалили) иначе на сутки оставил бы полоски без стадий.
 */
export const isStageDictPayload = (value: unknown): boolean =>
    Array.isArray(value) && value.length > 0 && value.every(isStageDictItem);

/**
 * Явная инвалидация словарей (кнопка ⟳): записи остаются, но считаются
 * устаревшими — ближайший запрос отдаст их сразу и уйдёт за свежими.
 */
export const expireStageDictCaches = async (
    domain: string,
    entityIds: readonly string[],
): Promise<void> => {
    if (!domain) return;
    await Promise.all(
        entityIds.map(entityId =>
            expireSwrCache(getStageDictCacheKey(domain, entityId)),
        ),
    );
};
