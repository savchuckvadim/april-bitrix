import { Bitrix, type IBXDeal } from '@bitrix/index';

/**
 * Сделка из Битрикса по ID (crm.deal.get): после создания сделки из
 * конструктора её читают заново, чтобы приложение работало с живыми полями.
 * Сделки нет или REST недоступен — null: вызывающий решает, что делать дальше.
 */
export const readDeal = async (dealId: number): Promise<IBXDeal | null> => {
    try {
        return (await Bitrix.getService().deal.get(dealId)) ?? null;
    } catch (error) {
        console.warn(`deal: сделка ${dealId} не прочиталась`, error);
        return null;
    }
};
