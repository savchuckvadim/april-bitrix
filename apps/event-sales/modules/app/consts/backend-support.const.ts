/**
 * Готовность support-эндпоинтов бэка.
 *
 * Часть эндпоинтов event-support на бэке — заглушки: отвечают пустышками и
 * пишут warn «STUB …» (back/apps/event-sales/src/event-support/services/
 * event-support-stub.service.ts). Фронт при каждом старте бил по ним до
 * 12 HTTP-запросами впустую: до 10× `/deals` + `/result/count` +
 * `/pres/tmc-deals`. Хуже того, пустой ответ `/deals` помечал список
 * презентационных сделок «загруженным» и ГАСИЛ настоящий запрос
 * fetchPresentationDeals (гейт по isItemsFetched).
 *
 * Флаг на эндпоинт, а не один общий: реализовывать их будут по одному.
 * Эндпоинт реализован на бэке — переключить флаг, фронт снова ходит.
 * Образец замены заглушки прямым походом в Битрикс —
 * fetchPresentationDeals (entities/EventSale/model/EventSaleThunk.ts).
 */
export const BACKEND_SUPPORT_READY = {
    /** POST `/api/event-sales/deals` и `/new-task/init` (getInitSale). */
    companyDeals: false,
    /** POST `/api/event-sales/result/count` (fetchResults, NoCall). */
    resultCount: false,
    /** POST `/api/event-sales/pres/tmc-deals` (initReturnToTMC). */
    tmcDeals: false,
} as const;
