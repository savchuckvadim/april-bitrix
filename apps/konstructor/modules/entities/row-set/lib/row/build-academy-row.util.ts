import type { KRow, RowRole } from '../../model/types';
import { calcPeriodPrice, makeRowPrice } from '../price';
import type { BuildRowCtx } from './types';

/**
 * Строка Академии: своя формула (цена пакета, деление на monthQuantity,
 * без налога); null при несовместимом сроке договора (contractLong).
 */

export interface BuildAcademyRowInput extends BuildRowCtx {
    key: string;
    setId: string;
    role: RowRole;
    academyCode: string;
    supplyCode: string;
    contractCode: string;
}

export const buildAcademyRow = (input: BuildAcademyRowInput): KRow | null => {
    const { catalog } = input;
    const pkg = catalog.academy.find(item => item.code === input.academyCode);
    const contract = catalog.contracts.byCode[input.contractCode];
    if (!pkg || !contract) return null;

    if (!pkg.contractLong.includes(contract.durationMonths)) return null;

    const period = calcPeriodPrice({
        monthBase: pkg.price,
        contract,
        withTax: input.withTax,
        academyMonthQuantity: pkg.monthQuantity,
    });

    return {
        key: input.key,
        setId: input.setId,
        role: input.role,
        productType: 'academy',
        refs: {
            supplyCode: input.supplyCode,
            contractCode: contract.code,
            serviceCode: pkg.code,
        },
        names: {
            name: pkg.name,
            shortName: 'Академия ГАРАНТ',
            alternativeName: null,
        },
        price: makeRowPrice(period, contract),
        // Пакет «в часах» (без monthQuantity) живёт со своим количеством
        quantityLocked: !pkg.monthQuantity,
    };
};
