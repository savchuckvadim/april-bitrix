import type {
    Catalog,
    ComplectType,
    KContract,
    KSupply,
} from '../model/types';

/**
 * Единая матрица совместимости комплект × поставка × договор.
 * В легаси была продублирована в трёх местах (generateGarantProducts,
 * filterContracts, filterSupplies) — здесь единственный источник истины.
 */

/** Поставки, доступные линейке: PROF — без Стандартной и Локальной */
export const filterSuppliesForComplect = (
    supplies: KSupply[],
    complectType: ComplectType,
): KSupply[] => {
    if (complectType !== 'prof') return supplies;
    return supplies.filter(
        supply =>
            !(supply.type === 'internet' && supply.usersQuantity === 0) &&
            supply.code !== 'proxima_local',
    );
};

/** Коды договоров, допустимые для комбинации линейка × поставка */
export const allowedContractCodes = (
    complectType: ComplectType,
    supply: Pick<KSupply, 'type' | 'code'>,
): readonly string[] => {
    if (supply.type === 'internet') {
        return complectType === 'prof'
            ? [
                  'internet',
                  'abonHalf',
                  'abonYear',
                  'abonTwoYears',
                  'licHalf',
                  'licYear',
                  'licTwoYears',
                  'key',
              ]
            : ['internet', 'licHalf', 'licYear', 'licTwoYears', 'key'];
    }
    // proxima: Флэш — только договор услуг
    if (supply.code === 'proxima_flash') return ['proxima'];
    return ['proxima', 'licHalf', 'licYear', 'licTwoYears', 'key'];
};

export const filterContractsForSupply = (
    catalog: Catalog,
    complectType: ComplectType,
    supplyCode: string,
): KContract[] => {
    const supply = catalog.supplies.byCode[supplyCode];
    if (!supply) return [];
    const allowed = allowedContractCodes(complectType, supply);
    return catalog.contracts.items.filter(contract =>
        allowed.includes(contract.code),
    );
};

export const isCompatible = (
    catalog: Catalog,
    complectType: ComplectType,
    supplyCode: string,
    contractCode: string,
): boolean => {
    const supply = catalog.supplies.byCode[supplyCode];
    if (!supply) return false;
    return allowedContractCodes(complectType, supply).includes(contractCode);
};
