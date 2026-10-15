'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HOOKS_PORTAL_QUERY_PARAM } from '../../consts/hooks.const';
import { parsePortalIdParam } from '../../lib/hooks-view';

export interface HooksPortalSelection {
    portalId: number | undefined;
    /** Портал задан маршрутом (карточка портала) — селектора нет. */
    isFixed: boolean;
    setPortalId: (portalId: number | undefined) => void;
}

/**
 * Выбранный портал раздела «Хуки и автоматика»: в карточке портала — из
 * маршрута, в глобальном разделе — из `?portalId=`. В адресе, а не в
 * состоянии: ссылка на хук с выбранным порталом переживает перезагрузку и
 * копирование коллеге.
 *
 * `useSearchParams` требует границы Suspense на странице.
 */
export const useHooksPortalSelection = (
    fixedPortalId?: number,
): HooksPortalSelection => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const fromQuery = parsePortalIdParam(
        searchParams.get(HOOKS_PORTAL_QUERY_PARAM),
    );

    const setPortalId = useCallback(
        (portalId: number | undefined) => {
            if (fixedPortalId) return;
            const next = new URLSearchParams(searchParams.toString());
            if (portalId) {
                next.set(HOOKS_PORTAL_QUERY_PARAM, String(portalId));
            } else {
                next.delete(HOOKS_PORTAL_QUERY_PARAM);
            }
            const query = next.toString();
            router.replace(query ? `${pathname}?${query}` : pathname);
        },
        [fixedPortalId, pathname, router, searchParams],
    );

    return {
        portalId: fixedPortalId ?? fromQuery,
        isFixed: Boolean(fixedPortalId),
        setPortalId,
    };
};
