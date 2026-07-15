'use client';

import { useRouter } from 'next/navigation';
import { EVENT_ROUTE_PATH } from './event-routes';
import { ROUTE_EVENT } from '../types/event-types';

/**
 * Типизированная навигация по флоу событий на нативном Next-роутере.
 *
 * Паттерн: thunk меняет состояние процесса и возвращает результат,
 * UI-обработчик после dispatch'а вызывает toItem()/toFinish()/toList().
 */
export const useEventNavigation = () => {
    const router = useRouter();

    return {
        toList: () => router.push(EVENT_ROUTE_PATH[ROUTE_EVENT.LIST]),
        toItem: () => router.push(EVENT_ROUTE_PATH[ROUTE_EVENT.ITEM]),
        toFinish: () => router.push(EVENT_ROUTE_PATH[ROUTE_EVENT.FINISH]),
        back: () => router.back(),
    };
};
