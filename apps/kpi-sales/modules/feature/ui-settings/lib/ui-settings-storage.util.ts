import {
    getAllBlockStates,
    getBlockState,
} from '@/modules/entities/report/lib/localStorage-util';
import type { UiSettingsBlob } from './ui-settings.types';

/** Кэш блоба UI-настроек, per domain+userId (бэк — источник истины). */
const CACHE_PREFIX = 'kpi-ui-settings-';
const BLOCKS_PREFIX = 'kpi-report-blocks-';

/** Префиксы ключей usePersistedSelection (выборы в графиках). */
const CHART_SELECTION_PREFIXES = [
    'kpi-rating-action-',
    'kpi-conversion-rating-',
    'kpi-action-',
];

const cacheKey = (domain: string, userId: number) =>
    `${CACHE_PREFIX}${domain}-${userId}`;

export const loadUiSettingsCache = (
    domain: string,
    userId: number,
): UiSettingsBlob | null => {
    if (typeof window === 'undefined' || !domain || !userId) return null;
    try {
        const raw = window.localStorage.getItem(cacheKey(domain, userId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as UiSettingsBlob;
        return parsed?.version === 1 ? parsed : null;
    } catch {
        return null;
    }
};

export const saveUiSettingsCache = (
    domain: string,
    userId: number,
    blob: UiSettingsBlob,
): void => {
    if (typeof window === 'undefined' || !domain || !userId) return;
    try {
        window.localStorage.setItem(
            cacheKey(domain, userId),
            JSON.stringify(blob),
        );
    } catch {
        // localStorage может быть недоступен — некритично
    }
};

/** Текущие выборы графиков из localStorage (для сборки блоба). */
export const collectChartSelections = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const result: Record<string, string> = {};
    try {
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (!key) continue;
            if (!CHART_SELECTION_PREFIXES.some(p => key.startsWith(p))) {
                continue;
            }
            const value = window.localStorage.getItem(key);
            if (value) result[key] = value;
        }
    } catch {
        // noop
    }
    return result;
};

/**
 * Применение блоба к не-Redux хранилищам (блоки, выборы графиков) —
 * сырые записи в localStorage, БЕЗ touch-события (иначе цикл автосейва).
 * Компоненты читают эти ключи при монтировании.
 */
export const applyBlobToLocalStores = (blob: UiSettingsBlob): void => {
    if (typeof window === 'undefined') return;
    try {
        Object.entries(blob.blocks ?? {}).forEach(([blockId, state]) => {
            window.localStorage.setItem(
                `${BLOCKS_PREFIX}${blockId}`,
                JSON.stringify(state),
            );
        });
        Object.entries(blob.chartSelections ?? {}).forEach(([key, value]) => {
            window.localStorage.setItem(key, value);
        });
    } catch {
        // noop
    }
};

/** Снимок текущих локальных настроек блоков (для сборки/seed блоба). */
export const collectBlockStates = getAllBlockStates;

export { getBlockState };
