'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { initialEventApp } from '../model/EventThunk';
import { useEventNavigation } from '../lib/use-event-navigation';
import { EVENT_ROUTE_PATH } from '../lib/event-routes';
import { ROUTE_EVENT } from '../types/event-types';

/**
 * Оркестрация event-процесса: init один раз после app shell +
 * единственный декларативный переход — отправка завершена (isFinish) → /finish.
 * Остальная навигация — императивно из UI (useEventNavigation).
 */
export const EventProcessInit = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();
    const pathname = usePathname();

    const initialized = useAppSelector(s => s.app.initialized);
    const isFinish = useAppSelector(s => s.event.isFinish);

    const didInit = useRef(false);
    useEffect(() => {
        if (initialized && !didInit.current) {
            didInit.current = true;
            dispatch(initialEventApp());
        }
    }, [initialized]);

    useEffect(() => {
        if (isFinish && pathname !== EVENT_ROUTE_PATH[ROUTE_EVENT.FINISH]) {
            nav.toFinish();
        }
    }, [isFinish, pathname]);

    return null;
};

export default EventProcessInit;
