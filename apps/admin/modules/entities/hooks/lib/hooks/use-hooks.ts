'use client';

import { useQuery } from '@tanstack/react-query';
import {
    HOOK_CATALOG_STALE_MS,
    HOOK_OPERATIONS_LIMIT,
    HOOK_OPERATIONS_REFETCH_MS,
} from '../../consts/hooks.const';
import { HooksHelper } from '../api/hooks-helper';

const helper = new HooksHelper();

/** Общий префикс ключей кэша раздела «Хуки и автоматика». */
export const HOOKS_QUERY_KEY = ['hooks'] as const;

/** Каталог хуков (статический, без состояния портала). */
export const useHookCatalog = () =>
    useQuery({
        queryKey: [...HOOKS_QUERY_KEY, 'catalog'],
        queryFn: () => helper.listCatalog(),
        staleTime: HOOK_CATALOG_STALE_MS,
    });

/** Полная карточка хука по коду. 404 — кода нет, ретраи его только повторяют. */
export const useHookEntry = (code: string | undefined) =>
    useQuery({
        queryKey: [...HOOKS_QUERY_KEY, 'entry', code ?? ''],
        queryFn: () => helper.getEntry(code as string),
        enabled: !!code,
        staleTime: HOOK_CATALOG_STALE_MS,
        retry: false,
    });

/** Готовность всех хуков на портале. */
export const usePortalHooksReadiness = (portalId?: number) =>
    useQuery({
        queryKey: [...HOOKS_QUERY_KEY, 'portal', portalId ?? 0, 'readiness'],
        queryFn: () => helper.portalReadiness(portalId as number),
        enabled: !!portalId,
    });

/** Готовность одного хука на портале. */
export const usePortalHookReadiness = (
    portalId: number | undefined,
    code: string | undefined,
) =>
    useQuery({
        queryKey: [
            ...HOOKS_QUERY_KEY,
            'portal',
            portalId ?? 0,
            'readiness',
            code ?? '',
        ],
        queryFn: () => helper.portalHookReadiness(portalId as number, code as string),
        enabled: !!portalId && !!code,
    });

/**
 * Операции sales-хуков портала (app-cache, окно час-два). Пока компонент
 * с хуком смонтирован — автообновление раз в `HOOK_OPERATIONS_REFETCH_MS`;
 * ручное обновление — `refetch()` результата.
 */
export const usePortalHookOperations = (
    portalId: number | undefined,
    hook: string | undefined,
    limit: number = HOOK_OPERATIONS_LIMIT,
) =>
    useQuery({
        queryKey: [
            ...HOOKS_QUERY_KEY,
            'portal',
            portalId ?? 0,
            'operations',
            hook ?? '',
            limit,
        ],
        queryFn: () =>
            helper.portalOperations(portalId as number, { hook, limit }),
        enabled: !!portalId,
        refetchInterval: HOOK_OPERATIONS_REFETCH_MS,
        refetchIntervalInBackground: false,
    });
