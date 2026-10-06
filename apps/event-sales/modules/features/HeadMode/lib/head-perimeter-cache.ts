import type { SwrCacheKey } from '@workspace/api';

/**
 * Список подчинённых руководителя — в кэше браузера.
 *
 * Список дел ждёт его перед первым запросом (дела сотрудников входят в
 * выборку), и раньше на КАЖДОМ открытии фрейма это был лишний круг до
 * сервера на критическом пути. Теперь со второго открытия список берётся
 * из кэша мгновенно, а свежий тихо приходит в фоне.
 *
 * В ключе — пользователь: на общем компьютере в одном браузере работают
 * разные сотрудники, а подчинённые у каждого свои.
 */
const HEAD_PERIMETER_CACHE_NAME = 'event-sales:head-perimeter';

/** Версия формы значения; поднимать при смене формы. */
const HEAD_PERIMETER_CACHE_VERSION = 1;

/** Протухает сразу: из кэша — мгновенно, обновление — в фоне. */
export const HEAD_PERIMETER_STALE_AFTER_MS = 0;

/** Что лежит в кэше. */
export interface HeadPerimeter {
    subordinateIds: number[];
}

export const getHeadPerimeterCacheKey = (
    domain: string,
    userId: number,
): SwrCacheKey => ({
    name: `${HEAD_PERIMETER_CACHE_NAME}:${userId}`,
    domain,
    version: HEAD_PERIMETER_CACHE_VERSION,
});

export const isHeadPerimeter = (value: unknown): boolean => {
    if (!value || typeof value !== 'object') return false;
    const ids = (value as { subordinateIds?: unknown }).subordinateIds;
    return Array.isArray(ids) && ids.every(id => Number.isInteger(id));
};

/** Тот же состав подчинённых, порядок не важен. */
export const sameSubordinates = (
    a: readonly number[],
    b: readonly number[],
): boolean => {
    if (a.length !== b.length) return false;
    const left = new Set(a);
    return b.every(id => left.has(id));
};
