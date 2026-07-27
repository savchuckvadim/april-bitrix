/**
 * Доменные типы каталога конструктора.
 * Вся адресация — по стабильным `code`; числовые number сохранены только
 * как справочная информация для маппинга легаси-слепков (entities/snapshot).
 */

export type ComplectType = 'prof' | 'universal';
export type SupplyKind = 'internet' | 'proxima';
/** Семейство договора: услуги (помесячно) / абонентский / лицензионный / ключ */
export type ContractKind = 'service' | 'abon' | 'lic' | 'key';
/** '1' — Москва, '0' — регионы (как region_type в прайсе) */
export type RegionScope = 'msk' | 'regions';

export interface KComplect {
    code: string;
    /** Легаси-номер комплекта (0..20) — только для маппинга слепков */
    number: number;
    type: ComplectType;
    title: string;
    fullTitle: string;
    shortTitle: string;
    weight: number;
    /** База абонентского обслуживания: цена universal = abs × region.abs × supply.coefficient */
    abs: number | null;
    color: string | null;
    withConsalting: boolean;
    withABS: boolean;
    withLt: boolean;
    withServices: boolean;
    withDefault: boolean;
    isChanging: boolean;
    /** Наполнение по умолчанию — codes */
    defaults: {
        infoblocks: string[];
        ers: string[];
        erPackets: string[];
        ersInPacket: string[];
    };
}

export interface KInfoblock {
    code: string;
    name: string;
    weight: number;
    groupCode: string;
    groupType: string;
    isFree: boolean;
    isLa: boolean;
    /** Коды пакетов, в которые входит блок */
    parents: string[];
    /** Коды дочерних блоков (для пакетов) */
    children: string[];
    description: string | null;
    shortDescription: string | null;
}

export interface KInfogroup {
    code: string;
    name: string;
    type: string;
    productType: string;
    infoblockCodes: string[];
}

export interface KSupply {
    code: string;
    /** Легаси-номер вида поставки (0..18) — только для маппинга слепков */
    number: number | null;
    name: string;
    fullName: string;
    shortName: string;
    type: SupplyKind;
    /** Количество одновременных доступов (ОД) */
    usersQuantity: number;
    /** Ценовой коэффициент (1 … 7) */
    coefficient: number;
    color: string | null;
}

export interface KMeasure {
    id: number;
    code: number;
    name: string;
    fullName: string;
}

export interface KContract {
    /** internet | proxima | abonHalf | abonYear | abonTwoYears | licHalf | licYear | licTwoYears | key */
    code: string;
    kind: ContractKind;
    name: string;
    shortName: string;
    /** Множитель длительности: 1 / 6 / 12 / 24 месяцев (легаси prepayment) */
    durationMonths: number;
    /** Скидка длительности: 1 / 0.9 / 0.8 / 0.7 */
    discount: number;
    /** ID товара каталога Bitrix */
    bitrixItemId: number;
    measure: KMeasure;
    /** Легаси-номер договора — только для маппинга слепков */
    number: number;
    order: number;
}

export interface KRegion {
    code: string;
    number: number;
    title: string;
    /** Ставка абонентского обслуживания региона */
    abs: number;
    tax: number;
    taxAbs: number;
    /** Название рег. инфоблока («Законодательство города Москвы») */
    infoblock: string;
    /** Вес региона в составе комплекта (0.5) */
    weight: number;
}

export type KServiceProductType = 'lt' | 'consalting' | 'star';

export interface KService {
    code: string;
    /** Легаси-номер — только для маппинга слепков */
    number: number;
    name: string;
    fullName: string;
    shortName: string;
    weight: number;
    /** Вес в АБС (консалтинг: sovex=1, pkpremium=3) */
    abs: number | null;
    color: string | null;
    productType: KServiceProductType;
    isPackage: boolean;
}

export interface KAcademyPackage {
    /** Легаси-номер пакета 1..21 (в слепке индекс = number − 1!) */
    number: number;
    code: string;
    name: string;
    totalHours: number;
    hoursInMonth: number | null;
    /** Цена пакета (мск и регионы совпадают) */
    price: number;
    /** Допустимые длительности договора в месяцах */
    contractLong: number[];
    /** Для пакетов «на срок» — число месяцев; null = «до конца действия комплекта» */
    monthQuantity: number | null;
}

export interface KPrice {
    code: string;
    value: number;
    regionScope: RegionScope;
    supplyType: SupplyKind | null;
    supplyCode: string | null;
    complectCode: string | null;
    /** Код пакета/сервиса (LT-пакеты, СТАР и т.п.) */
    packageCode: string | null;
    isSpecial: boolean;
    discount: number | null;
}

export interface PriceTable {
    items: KPrice[];
}

export interface Catalog {
    complects: {
        prof: KComplect[];
        universal: KComplect[];
        byCode: Record<string, KComplect>;
    };
    infoblocks: Record<string, KInfoblock>;
    groups: KInfogroup[];
    supplies: { items: KSupply[]; byCode: Record<string, KSupply> };
    contracts: { items: KContract[]; byCode: Record<string, KContract> };
    regions: { items: KRegion[]; byCode: Record<string, KRegion> };
    services: {
        lt: KService[];
        ltPackages: KService[];
        consalting: KService[];
        star: KService[];
    };
    academy: KAcademyPackage[];
    prices: PriceTable;
}

/** Пустой каталог — начальное состояние слайса */
export const emptyCatalog = (): Catalog => ({
    complects: { prof: [], universal: [], byCode: {} },
    infoblocks: {},
    groups: [],
    supplies: { items: [], byCode: {} },
    contracts: { items: [], byCode: {} },
    regions: { items: [], byCode: {} },
    services: { lt: [], ltPackages: [], consalting: [], star: [] },
    academy: [],
    prices: { items: [] },
});
