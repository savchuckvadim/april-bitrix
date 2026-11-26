import { Bitrix, type IBXCompany, type IBXDeal } from '@bitrix/index';

/** Поля сделки, которых достаточно для выбора (список по COMPANY_ID). */
const COMPANY_DEAL_SELECT = [
    'ID',
    'TITLE',
    'CLOSED',
    'DATE_CREATE',
    'COMPANY_ID',
    'CATEGORY_ID',
    'STAGE_ID',
    'STAGE_SEMANTIC_ID',
];

/**
 * Открытые сделки компании в одной воронке, свежие первыми (crm.deal.list).
 * Воронка и «не закрыта» уходят в фильтр Битрикса: у крупного клиента много
 * сделок других воронок, а список отдаёт не больше пятидесяти за вызов.
 * REST недоступен — пустой список: вход идёт как в компании без сделки.
 */
export const listOpenCompanyDeals = async (
    companyId: number,
    categoryId: number,
): Promise<IBXDeal[]> => {
    try {
        const response = await Bitrix.getService().deal.getList(
            {
                COMPANY_ID: String(companyId),
                CATEGORY_ID: String(categoryId),
                CLOSED: 'N',
            },
            COMPANY_DEAL_SELECT,
            { DATE_CREATE: 'DESC' },
        );
        return response?.result ?? [];
    } catch (error) {
        console.warn('app-init: сделки компании недоступны', error);
        return [];
    }
};

/**
 * Компания по ID из placement (crm.company.get). Нет компании или REST
 * недоступен — null: вызывающий показывает экран «компания недоступна».
 */
export const readCompany = async (
    companyId: number,
): Promise<IBXCompany | null> => {
    try {
        return (await Bitrix.getService().company.get(companyId)) ?? null;
    } catch (error) {
        console.warn('app-init: компания недоступна', error);
        return null;
    }
};
