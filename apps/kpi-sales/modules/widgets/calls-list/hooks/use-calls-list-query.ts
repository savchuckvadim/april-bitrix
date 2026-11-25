'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    buildCallsListSearch,
    callsListPeriodProblem,
    canonicalCallsListSearch,
    isCallsListFiltered,
    parseCallsListQuery,
    patchCallsListQuery,
    resetCallsListFilters,
    settleCallsListUrlWrite,
    type CallsListPatch,
    type CallsListQuery,
} from '@/modules/entities/calls-list';

/**
 * Фильтры и страница списка разборов. Действующие фильтры — состояние
 * страницы: нажатие видно сразу, а правки, сделанные подряд, складываются.
 * Адрес страницы — их зеркало: «назад» со страницы разбора возвращает к тем же
 * фильтрам. В адрес пишем replace без прокрутки (история окна не копит каждое
 * нажатие).
 *
 * Адрес обновляется с задержкой — переход доходит до страницы не сразу. Раньше
 * фильтры читались прямо из адреса, и второе быстрое нажатие затирало первое.
 * Теперь страница помнит свои записи в адрес и пропускает их, а адрес,
 * который сменили не мы (шаг по истории окна, ссылка), принимает как новые
 * фильтры. «Сегодня» берётся один раз при открытии — от него считается период
 * по умолчанию.
 */
export const useCallsListQuery = () => {
    const router = useRouter();
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const [today] = useState(() => new Date());

    const [query, setQuery] = useState(() => parseCallsListQuery(search, today));
    // Последние заданные фильтры — доступны сразу, до перерисовки страницы.
    const latest = useRef(query);
    // Адрес, который страница уже учла, и её записи в адрес, ещё не дошедшие.
    const seenSearch = useRef(search);
    const ownWrites = useRef<string[]>([]);

    useEffect(() => {
        if (search === seenSearch.current) return;
        seenSearch.current = search;
        const rest = settleCallsListUrlWrite(ownWrites.current, search);
        if (rest !== null) {
            ownWrites.current = rest;
            return;
        }
        // Адрес сменили не мы — фильтры берём из него.
        ownWrites.current = [];
        const next = parseCallsListQuery(search, today);
        latest.current = next;
        setQuery(next);
    }, [search, today]);

    const apply = useCallback(
        (next: CallsListQuery) => {
            latest.current = next;
            setQuery(next);
            const nextSearch = buildCallsListSearch(next, today);
            ownWrites.current = [
                ...ownWrites.current,
                canonicalCallsListSearch(nextSearch),
            ];
            router.replace(`${pathname}${nextSearch}`, { scroll: false });
        },
        [router, pathname, today],
    );

    const update = useCallback(
        (patch: CallsListPatch) =>
            apply(patchCallsListQuery(latest.current, patch)),
        [apply],
    );

    const reset = useCallback(
        () => apply(resetCallsListFilters(latest.current, today)),
        [apply, today],
    );

    return {
        query,
        update,
        reset,
        filtered: isCallsListFiltered(query, today),
        periodProblem: callsListPeriodProblem(query.from, query.to),
    };
};
