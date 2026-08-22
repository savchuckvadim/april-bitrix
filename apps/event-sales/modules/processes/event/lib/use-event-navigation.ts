'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EVENT_ROUTE_PATH } from './event-routes';
import { ROUTE_EVENT } from '../types/event-types';

/**
 * Типизированная навигация по флоу событий на нативном Next-роутере.
 *
 * Паттерн: thunk меняет состояние процесса и возвращает результат,
 * UI-обработчик после dispatch'а вызывает toItem()/toFinish()/toList().
 *
 * Роуты прогреваются заранее: переходов всего три, ходят по ним постоянно, а
 * без прогрева каждый push ждал RSC-payload — старый экран оставался на месте
 * весь запрос, и это читалось как «подвисло/мигнуло».
 */
export const useEventNavigation = () => {
    const router = useRouter();

    useEffect(() => {
        router.prefetch(EVENT_ROUTE_PATH[ROUTE_EVENT.LIST]);
        router.prefetch(EVENT_ROUTE_PATH[ROUTE_EVENT.ITEM]);
        router.prefetch(EVENT_ROUTE_PATH[ROUTE_EVENT.FINISH]);
    }, [router]);

    return {
        toList: () => router.push(EVENT_ROUTE_PATH[ROUTE_EVENT.LIST]),
        toItem: () => router.push(EVENT_ROUTE_PATH[ROUTE_EVENT.ITEM]),
        toFinish: () => router.push(EVENT_ROUTE_PATH[ROUTE_EVENT.FINISH]),
        back: () => router.back(),
    };
};
