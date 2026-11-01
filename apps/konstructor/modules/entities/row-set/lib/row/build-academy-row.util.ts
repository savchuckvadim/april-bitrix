import { academyFits, termMonthsOf } from '../../../catalog';
import type { KRow, RowRole } from '../../model/types';
import { calcPeriodPrice, makeRowPrice } from '../price';
import type { BuildRowCtx } from './types';

/**
 * Строка Академии: своя формула (цена пакета, деление на monthQuantity,
 * без налога). Пакет должен подходить под срок сделки — количество × договор
 * (легаси useAcademy); иначе строки нет. Пакет «на срок» живёт с количеством
 * набора, пакет «до конца комплекта» — со своим (легаси isAcademyWithoutDate).
 */

export interface BuildAcademyRowInput extends BuildRowCtx {
    key: string;
    setId: string;
    role: RowRole;
    academyCode: string;
    supplyCode: string;
    contractCode: string;
    /** Количество набора; срок сделки = количество × длительность договора */
    quantity?: number;
    /** Своё количество пакета «до конца комплекта», если строка уже была */
    ownQuantity?: number;
}

export const buildAcademyRow = (input: BuildAcademyRowInput): KRow | null => {
    const { catalog } = input;
    const pkg = catalog.academy.find(item => item.code === input.academyCode);
    const contract = catalog.contracts.byCode[input.contractCode];
    if (!pkg || !contract) return null;

    const quantity = input.quantity ?? 1;
    if (!academyFits(pkg, termMonthsOf(quantity, contract))) return null;

    const period = calcPeriodPrice({
        monthBase: pkg.price,
        contract,
        withTax: input.withTax,
        academyMonthQuantity: pkg.monthQuantity,
    });
    const quantityLocked = !pkg.monthQuantity;

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
        price: makeRowPrice(period, contract, quantityLocked ? (input.ownQuantity ?? 1) : quantity),
        quantityLocked,
    };
};
