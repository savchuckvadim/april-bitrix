import type { BitrixSmartOwnerType } from '../interface/bx-product-row.interface';

/**
 * Код владельца товарных строк по id типа смарт-процесса (entityTypeId):
 * `T` и шестнадцатеричная запись id строчными буквами. Для типа 140 это `T8c`.
 * Элемент смарта задаётся этим кодом и своим id в `crm.item.productrow.set`.
 */
export const buildSmartOwnerType = (entityTypeId: number): BitrixSmartOwnerType => {
    if (!Number.isInteger(entityTypeId) || entityTypeId <= 0) {
        throw new RangeError(
            `entityTypeId смарта должен быть положительным целым числом, получено ${entityTypeId}`,
        );
    }
    return `T${entityTypeId.toString(16)}`;
};
