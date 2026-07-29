import type {
    Catalog,
    ComplectType,
    KContract,
    KSupply,
} from '../model/types';
import { isCustomSupplyCode, resolveSupply } from './custom-od.util';

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
    // resolveSupply: справочник ИЛИ синтетическая X-ОД
    const supply = resolveSupply(catalog, supplyCode);
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
    const supply = resolveSupply(catalog, supplyCode);
    if (!supply) return false;
    return allowedContractCodes(complectType, supply).includes(contractCode);
};

/**
 * Цепочка сброса при смене комплекта (легаси selectCreatingRowsProp):
 * несовместимая поставка → первая допустимая, затем договор → первый
 * допустимый. Совместимые прежние значения сохраняются.
 */
export const resolveRefsForComplectChange = (
    catalog: Catalog,
    complectCode: string,
    prev: { supplyCode: string; contractCode: string },
): { supplyCode: string; contractCode: string } | null => {
    const complect = catalog.complects.byCode[complectCode];
    if (!complect) return null;
    const supplies = filterSuppliesForComplect(
        catalog.supplies.items,
        complect.type,
    );
    // X-ОД (quantity > 0) допустим для обеих линеек — сохраняем при смене комплекта
    const keepPrev =
        supplies.some(supply => supply.code === prev.supplyCode) ||
        isCustomSupplyCode(prev.supplyCode);
    const supplyCode = keepPrev
        ? prev.supplyCode
        : (supplies[0]?.code ?? null);
    if (!supplyCode) return null;
    const contractCode = resolveContractForSupplyChange(
        catalog,
        complect.type,
        supplyCode,
        prev.contractCode,
    );
    if (!contractCode) return null;
    return { supplyCode, contractCode };
};

/** Смена поставки: несовместимый договор сбрасывается на первый допустимый */
export const resolveContractForSupplyChange = (
    catalog: Catalog,
    complectType: ComplectType,
    supplyCode: string,
    prevContractCode: string,
): string | null => {
    const contracts = filterContractsForSupply(
        catalog,
        complectType,
        supplyCode,
    );
    if (contracts.some(contract => contract.code === prevContractCode)) {
        return prevContractCode;
    }
    return contracts[0]?.code ?? null;
};
