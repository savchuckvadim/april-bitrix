import type { KContract } from '../../../catalog';
import type { RowPrice } from '../../model/types';
import { round2 } from '../round.util';
import { finalizeRowPrice } from './commercial-edit.util';

/**
 * Налог поставщика — ЕДИНСТВЕННОЕ место правила:
 * «поставщик с налогом влияет на цену, НО НЕ на лицензионные договоры».
 * (легаси getWithTax + changeProviderTax, docs/legacy-core.md §6.2)
 */

export const TAX_COEFFICIENT = 1.05;

/** Налог применяется, только если у поставщика включён И договор не LIC */
export const isTaxApplied = (
    withTax: boolean,
    contract: Pick<KContract, 'kind'>,
): boolean => withTax && contract.kind !== 'lic';

/**
 * Смена налога поставщика на живой строке: base ×1.05 / ÷1.05 с пересчётом
 * current по сохранённой скидке. LIC-договор — цена не меняется.
 * НЕ пересобирает строку по каталогу — безопасно для восстановленных слепков.
 */
export const applyTaxChange = (
    price: RowPrice,
    contract: KContract,
    wasTaxed: boolean,
    nowTaxed: boolean,
): RowPrice => {
    if (contract.kind === 'lic' || wasTaxed === nowTaxed) return price;
    const factor = nowTaxed ? TAX_COEFFICIENT : 1 / TAX_COEFFICIENT;
    const base = round2(price.base * factor);
    const current = round2(base * price.discount.percent);
    return finalizeRowPrice({ ...price, base, current });
};
