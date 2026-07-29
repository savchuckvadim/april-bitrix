import type { Catalog } from '../../../catalog';
import type { RowSet } from '../../model/types';
import { applyTaxChange } from '../price';

/**
 * Массовая смена налога поставщика (легаси changeProviderTax):
 * base ×1.05 / ÷1.05 с пересчётом current по сохранённой скидке.
 * ЛИЦЕНЗИОННЫЕ договоры (внутри applyTaxChange) и бесплатные строки
 * пропускаются. В отличие от sync — НЕ пересобирает строки по каталогу,
 * поэтому безопасна для восстановленных слепков (денормализованные цены живут).
 */
export const applySetTaxChange = (
    set: RowSet,
    catalog: Catalog,
    wasTaxed: boolean,
    nowTaxed: boolean,
): RowSet => ({
    ...set,
    totalPrice: null,
    rows: set.rows.map(row => {
        if (row.isFree) return row;
        const contract = catalog.contracts.byCode[row.refs.contractCode];
        if (!contract) return row;
        return {
            ...row,
            price: applyTaxChange(row.price, contract, wasTaxed, nowTaxed),
        };
    }),
});
