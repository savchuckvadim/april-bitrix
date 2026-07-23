/**
 * Персист локального фильтра объединённого отчёта (пользователи/действия)
 * в localStorage, per-домен. Глобальный фильтр отчёта хранится на бэке,
 * этот — легковесный UI-фильтр конкретной таблицы.
 */
const KEY_PREFIX = 'kpi-merged-filter-';

export interface StoredMergedFilter {
    selectedUsers: number[];
    selectedActions: string[];
}

export const loadMergedFilter = (
    domain: string,
): StoredMergedFilter | null => {
    if (typeof window === 'undefined' || !domain) return null;
    try {
        const raw = window.localStorage.getItem(`${KEY_PREFIX}${domain}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredMergedFilter;
        return {
            selectedUsers: Array.isArray(parsed.selectedUsers)
                ? parsed.selectedUsers.map(Number)
                : [],
            selectedActions: Array.isArray(parsed.selectedActions)
                ? parsed.selectedActions.map(String)
                : [],
        };
    } catch {
        return null;
    }
};

export const saveMergedFilter = (
    domain: string,
    filter: StoredMergedFilter,
): void => {
    if (typeof window === 'undefined' || !domain) return;
    try {
        window.localStorage.setItem(
            `${KEY_PREFIX}${domain}`,
            JSON.stringify(filter),
        );
    } catch {
        // localStorage может быть недоступен (iframe/квоты) — не критично
    }
};
