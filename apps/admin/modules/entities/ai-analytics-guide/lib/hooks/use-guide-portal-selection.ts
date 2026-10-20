'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GUIDE_PORTAL_QUERY_PARAM } from '../../consts/ai-analytics-guide.const';
import { parseGuidePortalId } from '../guide-view';

export interface GuidePortalSelection {
    portalId: number | undefined;
    setPortalId: (portalId: number | undefined) => void;
}

/**
 * Выбранный портал путеводителя — в адресе (`?portalId=`), как у раздела
 * «Хуки»: ссылка на раздел с порталом переживает перезагрузку и
 * копирование коллеге. Якорь раздела (`#code`) при смене портала
 * сохраняется. `useSearchParams` требует Suspense на странице.
 */
export const useGuidePortalSelection = (): GuidePortalSelection => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const portalId = parseGuidePortalId(searchParams.get(GUIDE_PORTAL_QUERY_PARAM));

    const setPortalId = useCallback(
        (next: number | undefined) => {
            const params = new URLSearchParams(searchParams.toString());
            if (next) params.set(GUIDE_PORTAL_QUERY_PARAM, String(next));
            else params.delete(GUIDE_PORTAL_QUERY_PARAM);
            const query = params.toString();
            const hash = typeof window === 'undefined' ? '' : window.location.hash;
            router.replace(`${pathname}${query ? `?${query}` : ''}${hash}`);
        },
        [pathname, router, searchParams],
    );

    return { portalId, setPortalId };
};
