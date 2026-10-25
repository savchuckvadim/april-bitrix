/**
 * Сервисный отдел: сделка перезаключения ведёт две сборки — «текущий период»
 * (слепок самой сделки) и «следующий период» (слепок с `serviceSmartId`,
 * элемент смарта `service_offer`, привязанный к сделке). Решение владельца 8.
 */
export type ServicePeriodMode = 'deal' | 'smart';
export type ServiceOfferStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Тип смарта «предложение на будущий период» в портальной схеме */
export const SERVICE_OFFER_SMART_TYPE = 'service_offer';

export const SERVICE_PERIOD_TITLE: Record<ServicePeriodMode, string> = {
    deal: 'Текущий период',
    smart: 'Следующий период',
};
