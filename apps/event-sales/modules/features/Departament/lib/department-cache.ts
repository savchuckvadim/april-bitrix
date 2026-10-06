import type { SwrCacheKey } from '@workspace/api';
import type { BXUser } from '@workspace/bx';
import type { DepartmentStructureState } from '../type/department-type';

/**
 * Отдел продаж (сотрудники и структура) — в кэше браузера.
 *
 * Раньше отдел приходил с сервера на КАЖДОМ открытии фрейма, и форма ждала
 * его, чтобы поставить ответственного. Теперь со второго открытия отдел
 * берётся из кэша мгновенно, а свежий тихо приходит в фоне и обновляет
 * только список — выбранных в форме людей он не трогает (разбор нагрузки
 * 05.10.2026, пункт 2.4).
 *
 * Отдел общий для портала: в ключе только домен.
 */
const DEPARTMENT_CACHE_NAME = 'event-sales:sales-department';

/** Версия формы значения; поднимать при смене формы. */
const DEPARTMENT_CACHE_VERSION = 1;

/** Протухает сразу: из кэша — мгновенно, обновление — в фоне. */
export const DEPARTMENT_STALE_AFTER_MS = 0;

/** Что лежит в кэше. */
export interface CachedDepartment {
    users: BXUser[];
    structure: DepartmentStructureState | null;
}

export const getDepartmentCacheKey = (domain: string): SwrCacheKey => ({
    name: DEPARTMENT_CACHE_NAME,
    domain,
    version: DEPARTMENT_CACHE_VERSION,
});

const isUser = (value: unknown): boolean =>
    !!value &&
    typeof value === 'object' &&
    'ID' in value &&
    (typeof (value as { ID: unknown }).ID === 'string' ||
        typeof (value as { ID: unknown }).ID === 'number');

const isStructure = (value: unknown): boolean => {
    if (value === null) return true;
    if (!value || typeof value !== 'object') return false;
    const structure = value as Record<string, unknown>;
    return (
        Array.isArray(structure.general) &&
        Array.isArray(structure.children) &&
        Array.isArray(structure.parents)
    );
};

/** Запись кэша той формы, что пишет этот код (после выкладки форма могла смениться). */
export const isCachedDepartment = (value: unknown): boolean => {
    if (!value || typeof value !== 'object') return false;
    const cached = value as { users?: unknown; structure?: unknown };
    return (
        Array.isArray(cached.users) &&
        cached.users.every(isUser) &&
        isStructure(cached.structure ?? null)
    );
};

/** Тот же отдел — значит, обновлять стор незачем (ответ сервера стабилен по форме). */
export const sameDepartment = (
    a: CachedDepartment,
    b: CachedDepartment,
): boolean => JSON.stringify(a) === JSON.stringify(b);
