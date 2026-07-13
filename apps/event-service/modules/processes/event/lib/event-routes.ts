import { ROUTE_EVENT } from '@/modules/processes/routes/types/router-type';

/**
 * Mapping between the event process state (`event.currentPage`) and Next.js routes.
 * The FSD `process` layer owns navigation; pages live under `app/`.
 */
export const EVENT_ROUTE_PATH: Record<ROUTE_EVENT, string> = {
    [ROUTE_EVENT.LIST]: '/',
    [ROUTE_EVENT.ITEM]: '/item',
    [ROUTE_EVENT.FINISH]: '/finish',
};

export const PATH_TO_EVENT_ROUTE: Record<string, ROUTE_EVENT> = {
    '/': ROUTE_EVENT.LIST,
    '/item': ROUTE_EVENT.ITEM,
    '/finish': ROUTE_EVENT.FINISH,
};
