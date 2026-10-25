import type { Catalog } from '../../catalog';
import { ltFreeWeight, ltPacketWeight, type Composition } from '../../composition';
import type { KRow } from '../../row-set';
import type { ContractLt } from '../model/dto';

const PAID_LT_FALLBACK = 'Legal Tech';

/**
 * Legal Tech договора названиями: бесплатная часть комплекта (сервисы + пакет
 * по их весу) и платный пакет (ltInPacket + пакет по весу; сервисы «другого
 * LT» — отдельными строками). Легаси считал то же по номерам и весам в PHP.
 */
export const buildContractLt = (catalog: Catalog, composition: Composition, rows: KRow[]): ContractLt => {
    const nameOf = (code: string) => {
        const service = catalog.services.lt.find(item => item.code === code);
        return service?.name ?? code;
    };
    const packageByWeight = (weight: number) =>
        weight > 0 ? catalog.services.ltPackages.find(pkg => pkg.weight === weight) : undefined;

    const freePackage = packageByWeight(ltFreeWeight(composition, catalog));
    const paidPackage = packageByWeight(ltPacketWeight(composition, catalog));
    const otherLt = rows.filter(row => row.productType === 'lt_other').map(row => row.names.name);
    const paidServices = [...composition.ltInPacket.map(nameOf), ...otherLt];

    return {
        freePacket: composition.lt.length ? (freePackage?.fullName ?? freePackage?.name ?? '') : '',
        freeServices: composition.lt.map(nameOf),
        paidPacket: paidServices.length ? (paidPackage?.fullName ?? paidPackage?.name ?? PAID_LT_FALLBACK) : '',
        paidServices,
    };
};
