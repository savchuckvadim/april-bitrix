import type { Catalog, KService } from '../../../catalog';
import { LT_PACKAGE_BY_WEIGHT } from '../../../catalog';
import type { Composition } from '../../../composition';
import { ltPacketWeight } from '../../../composition';

/**
 * Платный LT-пакет по составу ltInPacket: пакет ищется в каталоге (БД)
 * по суммарному весу; статическая таблица — только fallback по коду.
 */
export const resolveLtPackage = (
    catalog: Catalog,
    composition: Composition,
): KService | null => {
    const weight = ltPacketWeight(composition, catalog);
    if (weight === 0) return null;
    const byWeight = catalog.services.ltPackages.find(
        pkg => pkg.weight === weight,
    );
    if (byWeight) return byWeight;
    const meta = LT_PACKAGE_BY_WEIGHT[weight];
    if (!meta) return null;
    return (
        catalog.services.ltPackages.find(pkg => pkg.code === meta.code) ?? null
    );
};
