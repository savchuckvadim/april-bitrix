'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/modules/app';
import { useReload } from '@/modules/app/lib/hooks/app';
import { ROUTE_KONSTRUCTOR } from '@/modules/shared/lib/routing';
import { useKonstructorNavigation } from '@/modules/shared/lib/routing';
import { selectEntryTarget } from '../model/entry.selectors';

/**
 * Вход в приложение: ждёт данные для решения и однократно уводит на нужный
 * экран (replace — «назад» не должен возвращать на пустой вход).
 */
export const useEntryGate = () => {
    const target = useAppSelector(selectEntryTarget);
    const nav = useKonstructorNavigation();
    const { reload } = useReload();

    useEffect(() => {
        nav.prefetch([
            ROUTE_KONSTRUCTOR.START,
            ROUTE_KONSTRUCTOR.VARIANTS,
            ROUTE_KONSTRUCTOR.DOCUMENT,
        ]);
    }, [nav]);

    useEffect(() => {
        if (target === 'wait' || target === 'catalog-failed') return;
        nav.replace(target);
    }, [target, nav]);

    return {
        isCatalogFailed: target === 'catalog-failed',
        reload,
    };
};
