import type { Catalog, KSupply, SupplyKind } from '../model/types';

/**
 * X-ОД — произвольное количество одновременных доступов, заданное
 * пользователем (нет в справочнике поставок). Системное решение:
 * синтетический КОД поставки `x_<type>_<n>` живёт в KRow.refs.supplyCode —
 * благодаря этому слепок v2, sync, пересборка и deal-send получают кастомное
 * количество без спец-веток: везде, где раньше был byCode-лукап, теперь
 * resolveSupply(). Коэффициент цены — линейная интерполяция между соседними
 * справочными поставками того же типа (за пределами — ближняя).
 * ⚠️ Формула цены X-ОД (интерполяция) — рабочее допущение, согласовать с
 * бизнесом; цена строки в любом случае правится вручную.
 */

const CUSTOM_PREFIX = 'x_';

export const CUSTOM_OD_MIN = 1;
export const CUSTOM_OD_MAX = 999;

export const isCustomSupplyCode = (code: string): boolean =>
    code.startsWith(CUSTOM_PREFIX);

export const makeCustomSupplyCode = (
    type: SupplyKind,
    usersQuantity: number,
): string => `${CUSTOM_PREFIX}${type}_${usersQuantity}`;

export const parseCustomSupplyCode = (
    code: string,
): { type: SupplyKind; usersQuantity: number } | null => {
    if (!isCustomSupplyCode(code)) return null;
    const match = /^x_(internet|proxima)_(\d+)$/.exec(code);
    if (!match) return null;
    const usersQuantity = Number(match[2]);
    if (
        !Number.isInteger(usersQuantity) ||
        usersQuantity < CUSTOM_OD_MIN ||
        usersQuantity > CUSTOM_OD_MAX
    ) {
        return null;
    }
    return { type: match[1] as SupplyKind, usersQuantity };
};

/**
 * Соседние справочные поставки типа по количеству ОД (только с ОД > 0 —
 * «Стандартная»/«Локальная» не участвуют). lower ≤ quantity ≤ upper.
 */
export const neighborSupplies = (
    catalog: Catalog,
    type: SupplyKind,
    usersQuantity: number,
): { lower: KSupply | null; upper: KSupply | null } => {
    const candidates = catalog.supplies.items
        .filter(supply => supply.type === type && supply.usersQuantity > 0)
        .sort((a, b) => a.usersQuantity - b.usersQuantity);
    let lower: KSupply | null = null;
    let upper: KSupply | null = null;
    for (const supply of candidates) {
        if (supply.usersQuantity <= usersQuantity) lower = supply;
        if (supply.usersQuantity >= usersQuantity && !upper) upper = supply;
    }
    return { lower, upper };
};

/** Линейная интерполяция значения между соседями (за пределами — ближний) */
export const interpolateByOd = (
    lower: { usersQuantity: number; value: number } | null,
    upper: { usersQuantity: number; value: number } | null,
    usersQuantity: number,
): number | null => {
    if (lower && upper) {
        if (lower.usersQuantity === upper.usersQuantity) return lower.value;
        const ratio =
            (usersQuantity - lower.usersQuantity) /
            (upper.usersQuantity - lower.usersQuantity);
        return lower.value + (upper.value - lower.value) * ratio;
    }
    return lower?.value ?? upper?.value ?? null;
};

/** Синтетическая поставка X-ОД; null — некорректное количество/нет соседей */
export const makeCustomSupply = (
    catalog: Catalog,
    type: SupplyKind,
    usersQuantity: number,
): KSupply | null => {
    const code = makeCustomSupplyCode(type, usersQuantity);
    if (!parseCustomSupplyCode(code)) return null;
    const { lower, upper } = neighborSupplies(catalog, type, usersQuantity);
    const coefficient = interpolateByOd(
        lower && { usersQuantity: lower.usersQuantity, value: lower.coefficient },
        upper && { usersQuantity: upper.usersQuantity, value: upper.coefficient },
        usersQuantity,
    );
    if (coefficient === null) return null;
    const typeName = type === 'internet' ? 'Интернет' : 'Проксима';
    const name = `${typeName} ${usersQuantity} ОД (X)`;
    return {
        code,
        number: null,
        name,
        fullName: name,
        shortName: name,
        type,
        usersQuantity,
        coefficient: Math.round(coefficient * 10000) / 10000,
        color: null,
    };
};

/**
 * ЕДИНАЯ точка разрешения кода поставки: справочник ИЛИ синтетическая X-ОД.
 * Использовать вместо catalog.supplies.byCode во всех доменных путях.
 */
export const resolveSupply = (
    catalog: Catalog,
    code: string,
): KSupply | null => {
    const fromCatalog = catalog.supplies.byCode[code];
    if (fromCatalog) return fromCatalog;
    const parsed = parseCustomSupplyCode(code);
    if (!parsed) return null;
    return makeCustomSupply(catalog, parsed.type, parsed.usersQuantity);
};
