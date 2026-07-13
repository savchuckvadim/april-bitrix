'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { EVENT_ROUTE_PATH } from '../lib/event-routes';
import { initialEventApp } from '../model/EventThunk';
import { getInitPresentation } from '@/modules/entities/EventPresentation';

/**
 * FSD `process` router for the event flow.
 *
 * It sits ABOVE the pages: it translates the Redux process state
 * (`event.currentPage`) into Next.js navigation, and runs the event-process
 * orchestration (init / presentation fetch). Renders nothing — actions across
 * the app keep dispatching `eventActions.setCurrentPage`, and this component
 * turns that into `router.push`.
 */
export const EventRouter = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const initialized = useAppSelector(s => s.app.initialized);
    const currentPage = useAppSelector(s => s.event.currentPage);
    const depSetting = useAppSelector(s => s.app.department);
    const saleFetched = useAppSelector(s => s.eventTask.isFetched);
    const serviceFetched = useAppSelector(s => s.eventServiceTask.isFetched);

    // process init — once the app shell is initialized
    const didInit = useRef(false);
    useEffect(() => {
        if (initialized && !didInit.current) {
            didInit.current = true;
            dispatch(initialEventApp());
        }
    }, [initialized]);

    // sync process state -> Next route
    useEffect(() => {
        const target = EVENT_ROUTE_PATH[currentPage];
        if (target && pathname !== target) {
            router.push(target);
        }
    }, [currentPage, pathname, router]);

    // presentation init when the relevant tasks are fetched
    useEffect(() => {
        const ready =
            (depSetting === APP_DEP.SALES && saleFetched) ||
            (depSetting === APP_DEP.SERVICE && serviceFetched);
        if (ready) dispatch(getInitPresentation());
    }, [depSetting, saleFetched, serviceFetched]);

    return null;
};

export default EventRouter;
