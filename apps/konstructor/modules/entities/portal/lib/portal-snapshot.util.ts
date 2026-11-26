import {
    resolveSwrCache,
    SWR_DAY_MS,
    type SwrResolveResult,
} from '@workspace/api';

import type { Portal } from '../model/dto';
import { PortalHelper } from './api/portal-helper';
import { KONSTRUCTOR_PORTAL_QUERY, portalFromParts } from './portal-parts.util';

/** Версия схемы слепка в кэше: меняем, когда меняется форма FrontPortalDto. */
const PORTAL_CACHE_VERSION = 2;

const helper = new PortalHelper();

/**
 * Портал для конструктора: только части, которые он читает (узкая ручка),
 * собранные в объект прежней формы. Узкая ручка недоступна (бэк ещё не
 * выложен или отвечает ошибкой) — берём полную модель, как раньше: вход в
 * конструктор от новой ручки не зависит.
 */
const fetchPortal = async (domain: string): Promise<Portal> => {
    try {
        return portalFromParts(
            await helper.fetchParts(domain, KONSTRUCTOR_PORTAL_QUERY),
        );
    } catch (error) {
        console.warn(
            'portal: узкая ручка недоступна — берём полную модель',
            error,
        );
        return helper.fetch(domain);
    }
};

/**
 * Слепок портала через swrCache: свежее — сразу, протухшее — сразу и обновление
 * в фоне, неудача обновления оставляет старое. Домен в ключе обязателен — два
 * портала в одном браузере не делят запись. Параллельные вызовы делят один
 * запрос, повторный после первого берёт кэш: app-init читает воронку продаж
 * из компании, а initPortal после setAppData получает тот же слепок мгновенно.
 */
export const loadPortalSnapshot = (
    domain: string,
    onUpdate?: (fresh: Portal) => void,
): Promise<SwrResolveResult<Portal>> =>
    resolveSwrCache<Portal>({
        key: { name: 'portal', domain, version: PORTAL_CACHE_VERSION },
        staleAfterMs: SWR_DAY_MS,
        fetcher: () => fetchPortal(domain),
        ...(onUpdate ? { onUpdate } : {}),
    });
