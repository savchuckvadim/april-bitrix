import type { Composition } from '../../composition';

/**
 * Строка (бывший ProductRowType) и сеты строк.
 * role заменяет легаси-магию `id === 0`:
 *  main — главный товар general-сета (в легаси единственный носитель наполнения),
 *  additional — дополнительный товар в general (в легаси «второй Гарант»),
 *  comparison — строка альтернативного сета («Для сравнения»).
 * composition теперь может быть у ЛЮБОЙ garant-строки.
 */

export type RowRole = 'main' | 'additional' | 'comparison';
export type RowProductType =
    | 'garant'
    | 'lt'
    | 'lt_other'
    | 'consalting'
    | 'star'
    | 'academy';

export interface RowDiscount {
    /** Коэффициент скидки (1 = без скидки, 0.8 = −20%) — легаси precent */
    percent: number;
    /** Скидка в рублях */
    amount: number;
    current: 'percent' | 'amount';
}

export interface RowMeasure {
    id: number;
    code: number;
    name: string;
    /** Длительность договора в месяцах (легаси measure.type: 1|6|12|24) */
    type: number;
}

export interface RowPrice {
    /** Цена без скидки за период (легаси default) */
    base: number;
    /** Цена со скидкой (легаси current) */
    current: number;
    quantity: number;
    /** Цена в пересчёте на месяц */
    month: number;
    /** current × quantity */
    sum: number;
    measure: RowMeasure;
    discount: RowDiscount;
}

export interface RowRefs {
    complectCode?: string;
    supplyCode: string;
    contractCode: string;
    /** Код сервиса/пакета для lt/lt_other/consalting/star/academy строк */
    serviceCode?: string;
}

export interface RowNames {
    name: string;
    shortName: string;
    alternativeName: string | null;
}

export interface KRow {
    key: string;
    setId: string;
    role: RowRole;
    productType: RowProductType;
    refs: RowRefs;
    /** Наполнение — у garant-строк (у сервисных строк отсутствует) */
    composition?: Composition;
    names: RowNames;
    price: RowPrice;
    /** Бесплатная строка (star при withStar) */
    isFree?: boolean;
}

export interface RowSet {
    id: string;
    kind: 'general' | 'alternative';
    rows: KRow[];
    /** Свёрнутое отображение (легаси show: 'set') */
    collapsed: boolean;
}

export const MAX_COMPARISON_SETS = 7;
