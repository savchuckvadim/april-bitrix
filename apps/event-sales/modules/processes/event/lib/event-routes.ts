import { ROUTE_EVENT } from '../types/event-types';

/**
 * Единственный источник путей флоу событий. Навигация — нативный Next router
 * (см. useEventNavigation); redux хранит только состояние процесса, не роут.
 */
export const EVENT_ROUTE_PATH: Record<ROUTE_EVENT, string> = {
    [ROUTE_EVENT.LIST]: '/',
    [ROUTE_EVENT.ITEM]: '/item',
    [ROUTE_EVENT.FINISH]: '/finish',
};
