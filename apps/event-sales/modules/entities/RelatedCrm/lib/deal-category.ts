import type { RelatedDeal } from '../model';

/** Код воронки «ОП Основная» в слепке портала. */
export const BASE_SALES_CATEGORY_CODE = 'sales_base';

/** Код воронки «ОП Презентации» в слепке портала. */
export const PRESENTATION_SALES_CATEGORY_CODE = 'sales_presentation';

/**
 * Сделка главной воронки продаж («ОП Основная»).
 *
 * Категорию несёт стадия: сделкам из графа клиента categoryCode отдаёт бэк,
 * привязанным из портального дозапроса его проставляет mapBoundDeal по карте
 * категорий слепка (buildDealCategoryCodeMap). Слепка нет — категория
 * неизвестна и сделка основной не считается (fail-open: лучше показать
 * полоску, чем спрятать чужую).
 */
export const isBaseSalesDeal = (deal: RelatedDeal): boolean =>
    deal.stage?.categoryCode === BASE_SALES_CATEGORY_CODE;

/** Сделка воронки презентаций («ОП Презентации») — та же механика категории. */
export const isPresentationSalesDeal = (deal: RelatedDeal): boolean =>
    deal.stage?.categoryCode === PRESENTATION_SALES_CATEGORY_CODE;

/** Категория из слепка портала: номер воронки Битрикса + наш код. */
export interface PortalDealCategory {
    bitrixId: string | number;
    code: string;
}

/**
 * CATEGORY_ID → код воронки по слепку портала — единственный способ узнать
 * категорию сделки портального дозапроса: crm.deal.list кодов не знает,
 * а числовые id воронок на порталах разные.
 */
export const buildDealCategoryCodeMap = (
    categories: ReadonlyArray<PortalDealCategory> | undefined,
): Map<number, string> =>
    new Map(
        (categories ?? []).map(category => [
            Number(category.bitrixId),
            category.code,
        ]),
    );
