'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    fetchLibrary,
    filterLibraryItems,
    loadFromLibrary,
    patchLibraryItem,
    removeLibraryItem,
    selectLibraryItems,
    selectLibraryStatus,
    type LibraryKind,
    type LibraryScopeFilter,
    type LibraryVisibility,
} from '@/modules/entities/library';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';

/**
 * Экран библиотеки (избранное / акции): список по видимости, загрузка
 * заготовки в конструктор → хаб документов, правка своего.
 */
export const useLibraryScreen = (kind: LibraryKind) => {
    const dispatch = useAppDispatch();
    const nav = useKonstructorNavigation();
    const items = useAppSelector(selectLibraryItems);
    const status = useAppSelector(selectLibraryStatus);
    const error = useAppSelector(state => state.library.error);
    const loadingId = useAppSelector(state => state.library.loadingId);
    const userId = useAppSelector(state => Number(state.app.bitrix.user?.ID) || null);
    const hasDeal = useAppSelector(state => Boolean(state.app.dealId));
    const [scope, setScope] = useState<LibraryScopeFilter>('all');

    useEffect(() => {
        if (status === 'idle') void dispatch(fetchLibrary());
    }, [status, dispatch]);

    const visible = filterLibraryItems(items, kind, scope, userId);

    const load = async (id: number) => {
        const ok = await dispatch(loadFromLibrary(id));
        if (ok) nav.to(hasDeal ? ROUTE_KONSTRUCTOR.DOCUMENT : ROUTE_KONSTRUCTOR.PRICES);
    };

    return {
        kind,
        items: visible,
        total: items.filter(item => item.kind === kind).length,
        isLoading: status === 'loading' || status === 'idle',
        error: status === 'error' ? error : null,
        scope,
        setScope,
        loadingId,
        load,
        rename: (id: number, title: string) => dispatch(patchLibraryItem(id, { title })),
        setVisibility: (id: number, visibility: LibraryVisibility) =>
            dispatch(patchLibraryItem(id, { visibility })),
        archive: (id: number) => dispatch(patchLibraryItem(id, { isArchived: true })),
        remove: (id: number) => dispatch(removeLibraryItem(id)),
        refresh: () => dispatch(fetchLibrary()),
        toStart: () => nav.to(ROUTE_KONSTRUCTOR.START),
        toCreate: () => nav.to(ROUTE_KONSTRUCTOR.PARAMS),
    };
};

export type LibraryScreenState = ReturnType<typeof useLibraryScreen>;
