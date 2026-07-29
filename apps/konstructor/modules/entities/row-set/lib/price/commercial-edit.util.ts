import type { RowPrice } from '../../model/types';
import { round2 } from '../round.util';

/**
 * Редактирование коммерции строки (перенос легаси calculateTotalPrice,
 * docs/legacy-core.md §6.3): цена / количество / скидка %|₽ / сумма.
 */

export type CommercialEdit =
    | { kind: 'price'; value: number }
    | { kind: 'quantity'; value: number }
    | { kind: 'discountPercent'; value: number }
    | { kind: 'discountAmount'; value: number }
    | { kind: 'sum'; value: number };

export const applyCommercialEdit = (
    price: RowPrice,
    edit: CommercialEdit,
): RowPrice => {
    switch (edit.kind) {
        case 'price': {
            const current = round2(edit.value);
            return finalizeRowPrice({ ...price, current });
        }
        case 'quantity': {
            // Количество всегда целое (легаси toFixed(0)), границы 0 < q < 100
            const quantity = Math.round(edit.value);
            if (!(quantity > 0 && quantity < 100)) return price;
            return finalizeRowPrice({ ...price, quantity });
        }
        case 'discountPercent': {
            const percent = edit.value;
            const current = round2(price.base * percent);
            return finalizeRowPrice({
                ...price,
                current,
                discount: { ...price.discount, percent, current: 'percent' },
            });
        }
        case 'discountAmount': {
            const amount = round2(edit.value);
            const current = round2(price.base - amount);
            return finalizeRowPrice({
                ...price,
                current,
                discount: { ...price.discount, amount, current: 'amount' },
            });
        }
        case 'sum': {
            if (price.quantity <= 0) return price;
            const current = round2(edit.value / price.quantity);
            // Легаси-гард: -50 < (sum/qty)/base < 50
            if (price.base > 0) {
                const ratio = current / price.base;
                if (!(ratio > -50 && ratio < 50)) return price;
            }
            const next = finalizeRowPrice({ ...price, current });
            // Легаси: правка суммы перезаписывает month значением current
            return { ...next, month: next.current };
        }
    }
};

/**
 * Доводка производных полей после правки: sum, month, скидка (коэффициент
 * и рублёвая) — единая точка согласованности RowPrice.
 */
export const finalizeRowPrice = (price: RowPrice): RowPrice => ({
    ...price,
    sum: round2(price.current * price.quantity),
    month:
        price.measure.type > 0
            ? round2(price.base / price.measure.type)
            : price.base,
    discount: {
        ...price.discount,
        amount: round2(price.base - price.current),
        percent:
            price.base > 0
                ? Math.round((price.current / price.base) * 10000) / 10000
                : 1,
    },
});
