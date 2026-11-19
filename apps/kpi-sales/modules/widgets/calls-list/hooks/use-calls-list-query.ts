'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    buildCallsListSearch,
    callsListPeriodProblem,
    isCallsListFiltered,
    parseCallsListQuery,
    patchCallsListQuery,
    resetCallsListFilters,
    type CallsListPatch,
    type CallsListQuery,
} from '@/modules/entities/calls-list';

/**
 * Фильтры и страница списка разборов — в адресе страницы: «назад» со
 * страницы разбора возвращает к тем же фильтрам. Смена — replace без
 * прокрутки (история окна не копит каждое нажатие). «Сегодня» берётся один
 * раз при открытии — от него считается период по умолчанию.
 */
export const useCallsListQuery = () => {
    const router = useRouter();
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const [today] = useState(() => new Date());

    const query = useMemo(() => parseCallsListQuery(search, today), [search, today]);

    const replace = useCallback(
        (next: CallsListQuery) => {
            router.replace(`${pathname}${buildCallsListSearch(next, today)}`, {
                scroll: false,
            });
        },
        [router, pathname, today],
    );

    const update = useCallback(
        (patch: CallsListPatch) => replace(patchCallsListQuery(query, patch)),
        [replace, query],
    );

    const reset = useCallback(
        () => replace(resetCallsListFilters(query, today)),
        [replace, query, today],
    );

    return {
        query,
        update,
        reset,
        filtered: isCallsListFiltered(query, today),
        periodProblem: callsListPeriodProblem(query.from, query.to),
    };
};
