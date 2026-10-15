'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    DIGEST_TAB_PARAM,
    parseDigestTab,
    withDigestTab,
    type DigestTabKey,
} from '../lib/digest-tabs';

/** Подвкладка дайджеста из URL (`?dt=`) и переход на другую без перезагрузки. */
export const useDigestTab = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = parseDigestTab(searchParams.get(DIGEST_TAB_PARAM));

    const setTab = useCallback(
        (next: DigestTabKey) => {
            router.replace(`${pathname}${withDigestTab(searchParams.toString(), next)}`, {
                scroll: false,
            });
        },
        [router, pathname, searchParams],
    );

    return { tab, setTab };
};
