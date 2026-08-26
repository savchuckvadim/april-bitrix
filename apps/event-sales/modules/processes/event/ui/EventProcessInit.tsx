'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Bitrix } from '@workspace/bitrix';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { APP_SCROLL_CONTAINER_ID } from '@/modules/app/consts/app-scroll';
import { shouldFitWindow } from '@/modules/app/lib/utills/placement-util';
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
    const placement = useAppSelector(s => s.app.bitrix.placement);

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

    /*
     * Скролл к началу на каждый переход (todo2508 №16): во встройке-вкладке
     * фрейм растёт вниз по контенту, и после длинной страницы новая
     * открывалась «где-то внизу» — модалки (центр от высоты фрейма)
     * оказывались за краем экрана. Мотаем и внутренний контейнер (широкие
     * встройки), и документ, и РОДИТЕЛЬСКУЮ страницу портала (self-sized —
     * там прокручен именно родитель, изнутри его иначе не достать).
     */
    useEffect(() => {
        document.getElementById(APP_SCROLL_CONTAINER_ID)?.scrollTo(0, 0);
        window.scrollTo(0, 0);
        if (shouldFitWindow(placement)) {
            void Bitrix.getService().api.scrollParentTo(0);
        }
    }, [pathname, placement]);

    return null;
};

export default EventProcessInit;
