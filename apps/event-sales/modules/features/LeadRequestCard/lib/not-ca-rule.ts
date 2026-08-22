import type { LeadRequestCard, LeadRequestUpdate } from '../model';

/**
 * «Не ЦА» без типа портал не принимает.
 *
 * Правило живёт на бэке (`lead-request/update` отвечает 400 «Для статуса
 * „Не ЦА“ обязателен тип не ЦА»), и до этой проверки менеджер узнавал о нём
 * ровно так: выбрал статус — получил красную ошибку, а сам тип спрятан в
 * селекте, который до выбора статуса ещё и не показывался.
 *
 * Поэтому спрашиваем тип СРАЗУ, в момент выбора статуса, и отправляем оба
 * поля одним запросом.
 */

/** Код «Не ЦА» у статуса ЗАЯВКИ. */
export const NOT_CA_SITE_STATUS_CODE = 'op_lead_site_status3';
/** Код «Не ЦА» у статуса ЛИДА. */
export const NOT_CA_LEAD_STATUS_CODE = 'op_lead_status_ten';

/** Правка переводит заявку или лид в «Не ЦА». */
export const isNotCaPatch = (patch: Partial<LeadRequestUpdate>): boolean =>
    patch.siteStatusCode === NOT_CA_SITE_STATUS_CODE ||
    patch.leadStatusCode === NOT_CA_LEAD_STATUS_CODE;

/**
 * Спросить тип «не ЦА» перед сохранением: статус выбран, а типа нет ни в
 * правке, ни на самом лиде.
 */
export const needsNotCaType = (
    patch: Partial<LeadRequestUpdate>,
    card: LeadRequestCard | null,
): boolean =>
    isNotCaPatch(patch) &&
    !patch.notCaTypeCode &&
    !card?.notCaType?.currentCode;
