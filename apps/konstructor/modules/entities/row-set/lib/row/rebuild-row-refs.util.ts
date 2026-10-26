import {
    filterContractsForSupply,
    filterSuppliesForComplect,
    resolveContractForSupplyChange,
    resolveRefsForComplectChange,
    type Catalog,
} from '../../../catalog';
import { defaultComposition } from '../../../composition';
import type { KRow } from '../../model/types';
import type { RowSetContext } from '../set';
import { buildGarantRow } from './build-garant-row.util';

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

/**
 * Почему rebuildRowWithRefs вернул null — человеку: пустой каталог (нет
 * поставок/договоров/цен) раньше выглядел как «кнопка не работает».
 */
export const explainRefsRebuildFailure = (
    catalog: Catalog,
    context: RowSetContext,
    row: KRow,
    next: RowRefsPatch,
): string => {
    if (!context.regionCode) return 'Сначала выберите регион';
    const complectCode = next.complectCode ?? row.refs.complectCode ?? '';
    const complect = catalog.complects.byCode[complectCode];
    if (!complect) return `Комплект «${complectCode}» не найден в каталоге`;
    const title = complect.title;
    const supplies = filterSuppliesForComplect(catalog.supplies.items, complect.type);
    if (!supplies.length) {
        return `${title}: в каталоге нет видов поставки для линейки — каталог на сервере не заполнен`;
    }
    const supplyCode = next.supplyCode ?? row.refs.supplyCode;
    const contracts = filterContractsForSupply(catalog, complect.type, supplyCode);
    if (!contracts.length) {
        return `${title}: для поставки «${supplyCode}» нет допустимых договоров в каталоге`;
    }
    return `${title}: нет цены для этой поставки и региона в прайсе каталога`;
};

/** Ключ главной строки general-сета — один на всё приложение. */
export const MAIN_ROW_KEY = 'general_main';

/**
 * Главная строка под новые рефы (шаги «Параметры» и «Комплект»): есть —
 * пересборка по правилам rebuildRowWithRefs; нет — новая строка с
 * наполнением комплекта по умолчанию. null — у комбинации нет цены.
 */
export const buildMainRowWithRefs = (
    catalog: Catalog,
    context: RowSetContext,
    mainRow: KRow | null,
    refs: Required<RowRefsPatch>,
): KRow | null => {
    if (mainRow) return rebuildRowWithRefs(catalog, context, mainRow, refs);
    const complect = catalog.complects.byCode[refs.complectCode];
    if (!complect || !context.regionCode) return null;
    return buildGarantRow({
        catalog,
        regionCode: context.regionCode,
        withTax: context.withTax,
        key: MAIN_ROW_KEY,
        setId: 'general',
        role: 'main',
        ...refs,
        composition: defaultComposition(complect),
    });
};
