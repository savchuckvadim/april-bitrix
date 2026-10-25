'use client';

import { usePathname } from 'next/navigation';
import { useReload } from '@/modules/app/lib/hooks/app';
import {
    KONSTRUCTOR_ROUTE_PATH,
    ROUTE_KONSTRUCTOR,
    useKonstructorNavigation,
} from '@/modules/shared/lib/routing';

/** Действия шапки: «домой», служебные разделы, обновление. */
export const useAppShell = () => {
    const pathname = usePathname();
    const nav = useKonstructorNavigation();
    const { reload, isLoading } = useReload();

    const isAt = (route: ROUTE_KONSTRUCTOR) =>
        pathname.startsWith(KONSTRUCTOR_ROUTE_PATH[route]);

    return {
        isSettings: isAt(ROUTE_KONSTRUCTOR.SETTINGS),
        isRequisites: isAt(ROUTE_KONSTRUCTOR.REQUISITES),
        isReloading: isLoading,
        // «Домой» — на вход: он сам решит, где сейчас «дом» сделки
        toHome: () => nav.to(ROUTE_KONSTRUCTOR.ENTRY),
        toSettings: () => nav.to(ROUTE_KONSTRUCTOR.SETTINGS),
        toRequisites: () => nav.to(ROUTE_KONSTRUCTOR.REQUISITES),
        reload,
    };
};
