import type { Catalog } from '@/modules/entities/catalog';
import {
    resolveContractForSupplyChange,
    resolveRefsForComplectChange,
} from '@/modules/entities/catalog';
import { defaultComposition } from '@/modules/entities/composition';
import {
    buildGarantRow,
    type KRow,
    type RowSetContext,
} from '@/modules/entities/row-set';

export interface RowRefsPatch {
    complectCode?: string;
    supplyCode?: string;
    contractCode?: string;
}

/**
 * Смена комплекта/ОД/договора garant-строки: цепочки сброса по матрице
 * совместимости + пересборка строки по каталогу (легаси
 * changeCurrentProductAndPrice). Смена комплекта даёт новое дефолтное
 * наполнение и сбрасывает пользовательское имя; количество сохраняется.
 * null = комбинация без цены (правку не применять).
 */
export const rebuildRowWithRefs = (
    catalog: Catalog,
    context: RowSetContext,
    row: KRow,
    next: RowRefsPatch,
): KRow | null => {
    if (!context.regionCode) return null;
    const complectCode = next.complectCode ?? row.refs.complectCode ?? '';
    const targetComplect = catalog.complects.byCode[complectCode];
    if (!targetComplect) return null;

    let supplyCode = next.supplyCode ?? row.refs.supplyCode;
    let contractCode = next.contractCode ?? row.refs.contractCode;
    const isComplectChange = Boolean(
        next.complectCode && next.complectCode !== row.refs.complectCode,
    );

    if (isComplectChange) {
        const resolved = resolveRefsForComplectChange(catalog, complectCode, {
            supplyCode,
            contractCode,
        });
        if (!resolved) return null;
        supplyCode = resolved.supplyCode;
        contractCode = resolved.contractCode;
    } else if (next.supplyCode) {
        const resolved = resolveContractForSupplyChange(
            catalog,
            targetComplect.type,
            supplyCode,
            contractCode,
        );
        if (!resolved) return null;
        contractCode = resolved;
    }

    const rebuilt = buildGarantRow({
        catalog,
        regionCode: context.regionCode,
        withTax: context.withTax,
        key: row.key,
        setId: row.setId,
        role: row.role,
        complectCode,
        supplyCode,
        contractCode,
        composition: isComplectChange
            ? defaultComposition(targetComplect)
            : row.composition,
        quantity: row.price.quantity,
    });
    if (!rebuilt) return null;

    return {
        ...rebuilt,
        names: {
            ...rebuilt.names,
            alternativeName: isComplectChange
                ? null
                : row.names.alternativeName,
        },
    };
};
