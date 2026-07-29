import type { KContract } from '../../../catalog';
import type { RowPrice } from '../../model/types';
import { round2 } from '../round.util';
import { isTaxApplied, TAX_COEFFICIENT } from './tax.util';

/**
 * Цена за период договора (перенос легаси getRowFromProduct,
 * docs/legacy-core.md §6.2): base × durationMonths × tax × discount.
 * Академия «на срок» — деление на monthQuantity пакета, без налога.
 */

export interface PeriodPriceInput {
    /** Базовая цена за месяц (или за пакет для академии) */
    monthBase: number;
    contract: KContract;
    withTax: boolean;
    /** Академия «на срок»: цена пакета делится на его monthQuantity */
    academyMonthQuantity?: number | null;
}

export interface PeriodPrice {
    base: number;
    current: number;
    month: number;
}

export const calcPeriodPrice = (input: PeriodPriceInput): PeriodPrice => {
    const { monthBase, contract, withTax, academyMonthQuantity } = input;

    let base: number;
    if (academyMonthQuantity) {
        // Академия «на срок»: цена пакета × длительность / срок пакета, без налога
        base = (monthBase * contract.durationMonths) / academyMonthQuantity;
    } else {
        const tax = isTaxApplied(withTax, contract) ? TAX_COEFFICIENT : 1;
        base = monthBase * contract.durationMonths * tax;
    }
    base = round2(base);

    const current = round2(base * contract.discount);
    return {
        base,
        current,
        month: round2(base / contract.durationMonths),
    };
};

export const makeRowPrice = (
    period: PeriodPrice,
    contract: KContract,
    quantity = 1,
): RowPrice => ({
    base: period.base,
    current: period.current,
    quantity,
    month: period.month,
    sum: round2(period.current * quantity),
    measure: {
        id: contract.measure.id,
        code: contract.measure.code,
        name: contract.measure.name,
        type: contract.durationMonths,
    },
    discount: {
        percent: contract.discount,
        amount: round2(period.base - period.current),
        current: 'percent',
    },
});
