import { IBXDeal } from '../../shared/bitrix/bitrix.interface';

export interface SaleDto {
    /**
     * Сделка-связка «продажа ↔ презентация» (`IBXDeal`).
     * `null`, если связанной сделки нет. Структура соответствует сделке Bitrix.
     */
    relationSalePresDeal?: IBXDeal | null;

    /**
     * Сумма продажи — уходит в штатное поле OPPORTUNITY основной
     * сделки (+ IS_MANUAL_OPPORTUNITY=Y, чтобы Bitrix не пересчитал
     * её из товарных позиций). Обязательна при включённом
     * чек-листе продажи (checklist_sale_enabled).
     */
    opportunity?: number;

    /**
     * Дата первой оплаты (`YYYY-MM-DD`) — пишется в pbx-поле сделки
     * `first_pay_date` (konstructor-реестр); поле не установлено на
     * портале — значение молча пропускается.
     */
    firstPayDate?: string;
}
