import type { Catalog, KSupply, SupplyKind } from '../model/types';

/**
 * X-ОД — произвольное количество одновременных доступов, заданное
 * пользователем (нет в справочнике поставок). Системное решение:
 * синтетический КОД поставки `x_<type>_<n>` живёт в KRow.refs.supplyCode —
 * благодаря этому слепок v2, sync, пересборка и deal-send получают кастомное
 * количество без спец-веток: везде, где раньше был byCode-лукап, теперь
 * resolveSupply().
 *
 * Цена X-ОД НЕ вычисляется (решение владельца 14): строке подставляются
 * коэффициент и прайс ближайшей справочной поставки того же типа (снизу,
 * иначе сверху) с признаком «ориентировочная» — менеджер задаёт цену вручную.
 * Тексты договора/КП для X-ОД собирает бэк из шаблона той же справочной
 * поставки (SupplyTextService).
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

/** Справочная поставка с числом ОД в коде (internet_5); особые std/local/flash — нет. */
const isNumberedReference = (supply: KSupply): boolean =>
    supply.usersQuantity > 0 &&
    !isCustomSupplyCode(supply.code) &&
    /_\d+$/.test(supply.code);

/**
 * Соседние справочные поставки типа по количеству ОД («Стандартная»,
 * «Локальная», «Флэш» не участвуют). lower ≤ n ≤ upper.
 */
export const neighborSupplies = (
    catalog: Catalog,
    type: SupplyKind,
    usersQuantity: number,
): { lower: KSupply | null; upper: KSupply | null } => {
    const candidates = catalog.supplies.items
        .filter(supply => supply.type === type && isNumberedReference(supply))
        .sort((a, b) => a.usersQuantity - b.usersQuantity);
    let lower: KSupply | null = null;
    let upper: KSupply | null = null;
    for (const supply of candidates) {
        if (supply.usersQuantity <= usersQuantity) lower = supply;
        if (supply.usersQuantity >= usersQuantity && !upper) upper = supply;
    }
    return { lower, upper };
};

/**
 * Справочная поставка-источник для X-ОД: ближайшая снизу, иначе ближайшая
 * сверху (та же логика у бэка в SupplyTextService.findReference).
 */
export const referenceSupplyForCustom = (
    catalog: Catalog,
    type: SupplyKind,
    usersQuantity: number,
): KSupply | null => {
    const { lower, upper } = neighborSupplies(catalog, type, usersQuantity);
    return lower ?? upper;
};

/** Синтетическая поставка X-ОД; null — некорректное количество/нет справочных того же типа */
export const makeCustomSupply = (
    catalog: Catalog,
    type: SupplyKind,
    usersQuantity: number,
): KSupply | null => {
    const code = makeCustomSupplyCode(type, usersQuantity);
    if (!parseCustomSupplyCode(code)) return null;
    const reference = referenceSupplyForCustom(catalog, type, usersQuantity);
    if (!reference) return null;
    const typeName = type === 'internet' ? 'Интернет' : 'Проксима';
    const name = `${typeName} ${usersQuantity} ОД (X)`;
    return {
        code,
        name,
        fullName: name,
        shortName: name,
        type,
        usersQuantity,
        // коэффициент справочной поставки-источника: цена всё равно ориентировочная
        coefficient: reference.coefficient,
        color: null,
        // Тексты X-ОД (подпись КП, количество для договора) рендерит бэк по коду
        // x_<type>_<n> из шаблона ближайшей справочной поставки (SupplyTextService).
        quantityForKp: null,
        contractPropSuppliesQuantity: String(usersQuantity),
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
