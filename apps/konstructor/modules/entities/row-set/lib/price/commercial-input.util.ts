import type { KContract } from '../../../catalog';
import type { RowPrice } from '../../model/types';
import type { CommercialEdit } from './commercial-edit.util';

/**
 * Чистая логика полей ввода коммерции (цена/количество/скидка/сумма):
 * подписи, отображаемые значения и разбор пользовательского ввода
 * в CommercialEdit. UI-хук остаётся тривиальным.
 */

export type CommercialField = 'price' | 'quantity' | 'discount' | 'sum';

/**
 * «Аванс» — помесячный (durationMonths=1) сервисный договор
 * (легаси: measure.type === 1 && contract.number ∉ {9, 10} — т.е. не key).
 */
export const quantityFieldLabel = (
    contract: Pick<KContract, 'kind' | 'durationMonths'> | null,
): 'Аванс' | 'Количество' =>
    contract &&
    contract.durationMonths === 1 &&
    contract.kind === 'service'
        ? 'Аванс'
        : 'Количество';

/** Отображаемое значение скидки: %-режим → (1 − percent) × 100, ₽-режим → amount */
export const discountDisplayValue = (price: RowPrice): number =>
    price.discount.current === 'percent'
        ? Math.round((1 - price.discount.percent) * 10000) / 100
        : price.discount.amount;

/** «1 234,56» / «1234.56» → число; null = не число */
const parseNumber = (raw: string): number | null => {
    const normalized = raw.replace(/\s/g, '').replace(',', '.');
    if (normalized === '' || normalized === '-') return null;
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
};

/** Легаси-границы скидки (в отображаемых величинах): −1500 < v < 500 */
const DISCOUNT_MIN = -1500;
const DISCOUNT_MAX = 500;

/**
 * Разбор ввода → CommercialEdit. null = невалидный/вне границ ввод
 * (UI откатывает поле к текущему значению, ничего не диспатчит).
 */
export const parseCommercialInput = (
    field: CommercialField,
    raw: string,
    price: RowPrice,
): CommercialEdit | null => {
    const value = parseNumber(raw);
    if (value === null) return null;

    switch (field) {
        case 'price':
            return value >= 0 ? { kind: 'price', value } : null;
        case 'quantity': {
            const quantity = Math.round(value);
            return quantity > 0 && quantity < 100
                ? { kind: 'quantity', value: quantity }
                : null;
        }
        case 'discount': {
            if (!(value > DISCOUNT_MIN && value < DISCOUNT_MAX)) return null;
            return price.discount.current === 'percent'
                ? { kind: 'discountPercent', value: (100 - value) / 100 }
                : { kind: 'discountAmount', value };
        }
        case 'sum':
            return { kind: 'sum', value };
    }
};
