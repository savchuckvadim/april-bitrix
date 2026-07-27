import type { Catalog, KContract, KRegion, RegionScope } from '../../catalog';
import type { RowPrice } from '../model/types';

/**
 * Формулы цен (перенос legacy getRowFromProduct / getProfPrice /
 * calculateTotalPrice, см. docs/legacy-core.md §6):
 * - PROF: базовая цена из прайс-таблицы (комплект × поставка × регион);
 * - universal: abs комплекта × abs региона × коэффициент поставки;
 * - консалтинг: abs сервиса × abs региона (без коэффициента);
 * - LT-пакеты / СТАР: цена пакета msk/regions из прайса;
 * - академия: цена пакета; при monthQuantity делится на число месяцев (без налога);
 * - итог: base × durationMonths × tax(1.05, кроме лицензионных) × discount.
 */

export const TAX_COEFFICIENT = 1.05;

export const regionScope = (region: KRegion): RegionScope =>
    region.code === 'msk' ? 'msk' : 'regions';

/** Налог применяется, только если у поставщика включён и договор не лицензионный */
export const isTaxApplied = (
    withTax: boolean,
    contract: Pick<KContract, 'kind'>,
): boolean => withTax && contract.kind !== 'lic';

/** Базовая цена PROF-комплекта из прайс-таблицы (руб/мес) */
export const findProfBasePrice = (
    catalog: Catalog,
    complectCode: string,
    supplyCode: string,
    scope: RegionScope,
): number | null => {
    const price = catalog.prices.items.find(
        item =>
            item.complectCode === complectCode &&
            item.supplyCode === supplyCode &&
            item.regionScope === scope,
    );
    return price ? price.value : null;
};

/** Цена пакета/сервиса (LT-пакет, СТАР) из прайса по packageCode */
export const findPackagePrice = (
    catalog: Catalog,
    packageCode: string,
    scope: RegionScope,
): number | null => {
    const price = catalog.prices.items.find(
        item => item.packageCode === packageCode && item.regionScope === scope,
    );
    return price ? price.value : null;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

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

/** Цена за период договора: × durationMonths × tax × discount */
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

export type CommercialEdit =
    | { kind: 'price'; value: number }
    | { kind: 'quantity'; value: number }
    | { kind: 'discountPercent'; value: number }
    | { kind: 'discountAmount'; value: number }
    | { kind: 'sum'; value: number };

/** Редактирование коммерции строки (легаси calculateTotalPrice) */
export const applyCommercialEdit = (
    price: RowPrice,
    edit: CommercialEdit,
): RowPrice => {
    switch (edit.kind) {
        case 'price': {
            const current = round2(edit.value);
            return finalize({ ...price, current });
        }
        case 'quantity': {
            const quantity = edit.value;
            if (!(quantity > 0 && quantity < 100)) return price;
            return finalize({ ...price, quantity });
        }
        case 'discountPercent': {
            const percent = edit.value;
            const current = round2(price.base * percent);
            return finalize({
                ...price,
                current,
                discount: { ...price.discount, percent, current: 'percent' },
            });
        }
        case 'discountAmount': {
            const amount = round2(edit.value);
            const current = round2(price.base - amount);
            return finalize({
                ...price,
                current,
                discount: { ...price.discount, amount, current: 'amount' },
            });
        }
        case 'sum': {
            if (price.quantity <= 0) return price;
            const current = round2(edit.value / price.quantity);
            return finalize({ ...price, current });
        }
    }
};

const finalize = (price: RowPrice): RowPrice => ({
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

/** Смена налога поставщика: пересборка base (легаси changeProviderTax, LIC не трогаем) */
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
    return finalize({ ...price, base, current });
};
