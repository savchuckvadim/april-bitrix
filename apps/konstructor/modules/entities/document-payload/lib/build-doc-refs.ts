import type { Catalog, ContractKind, KContract, KSupply } from '../../catalog';
import type { DocContract, DocSupply } from '../model/dto';
import { contractNumberOf, supplyNumberOf } from './legacy-numbers.util';

/**
 * Договор и поставка в легаси-формах payload. Тексты поставки для договора
 * бэк резолвит сам по `code` (SupplyTextService) — здесь только адрес.
 */

/** Легаси contractType КП/договора: service | abon | lic | key */
export const contractTypeOf = (contract: Pick<KContract, 'kind'>): ContractKind => contract.kind;

export const toDocSupply = (catalog: Catalog, supply: KSupply): DocSupply => ({
    code: supply.code,
    usersQuantity: supply.usersQuantity,
    number: supplyNumberOf(catalog, supply),
    name: supply.name,
    type: supply.type,
    coefficient: supply.coefficient,
    quantityForKp: supply.quantityForKp ?? undefined,
    contractPropSuppliesQuantity: supply.contractPropSuppliesQuantity ?? undefined,
});

const nowIso = () => new Date().toISOString();

export const toDocContract = (contract: KContract): DocContract => {
    const number = contractNumberOf(contract.code);
    const measureBitrixId = String(contract.measure.code);
    return {
        id: 0,
        contract: {
            id: 0,
            name: contract.name,
            shortName: contract.shortName,
            fullName: contract.name,
            created_at: nowIso(),
            updated_at: null,
            productName: contract.name,
        },
        code: contract.code as DocContract['code'],
        shortName: contract.shortName,
        number,
        aprilName: contract.name,
        bitrixName: contract.name,
        discount: contract.discount,
        itemId: contract.bitrixItemId,
        prepayment: contract.durationMonths,
        order: contract.order,
        portalMeasure: {
            id: contract.measure.id,
            measure_id: contract.measure.id,
            portal_id: 0,
            bitrixId: measureBitrixId,
            name: contract.measure.name,
            shortName: contract.measure.name,
            fullName: contract.measure.fullName,
            created_at: nowIso(),
            updated_at: nowIso(),
            measure: {},
        },
        measureCode: contract.measure.code,
        measureFullName: contract.measure.fullName,
        measureId: contract.measure.id,
        measureName: contract.measure.name,
        measureNumber: contract.measure.id,
    };
};
