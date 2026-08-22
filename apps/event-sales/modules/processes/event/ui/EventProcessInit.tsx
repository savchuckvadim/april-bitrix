'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { cancelResultMenu } from '@/modules/widgets/EventItem';
import { initialEventApp } from '../model/EventThunk';
import { useEventNavigation } from '../lib/use-event-navigation';
import { useFitWindow } from '../lib/hooks/use-fit-window';
import { EVENT_ROUTE_PATH } from '../lib/event-routes';
import { shouldResetItemForm } from '../lib/should-reset-item-form';
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
    const isMenuActive = useAppSelector(s => s.eventItemMenu.isActive);

    // Подгонка высоты фрейма на каждой странице — только для вкладок карточки.
    useFitWindow();

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

    // Форма отчёта сбрасывается после ухода с дела — правило и почему именно
    // переход, а не «мы на списке», см. shouldResetItemForm.
    const prevPathname = useRef(pathname);
    useEffect(() => {
        const from = prevPathname.current;
        prevPathname.current = pathname;
        if (shouldResetItemForm({ from, to: pathname, isMenuActive })) {
            dispatch(cancelResultMenu());
        }
    }, [pathname, isMenuActive]);

    return null;
};

export default EventProcessInit;
