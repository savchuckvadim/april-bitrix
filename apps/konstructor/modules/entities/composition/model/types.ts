import type { Catalog, KComplect } from '../../catalog';

/**
 * Состав (наполнение) комплекта. В отличие от легаси — НЕ синглтон:
 * привязывается к конкретной garant-строке любого сета (KRow.composition).
 * Вся адресация — по code.
 */

export type CompositionMode = 'rules' | 'free';

export interface Composition {
    complectCode: string;
    /** rules — автокоррекции и запреты; free — только подсветка нарушений */
    mode: CompositionMode;
    /** Инфоблоки наполнения (codes) */
    infoblocks: string[];
    /** ЭР, выбранные отдельно (вес 0.5 каждая) */
    ers: string[];
    /** Активные пакеты ЭР (вес 1) */
    erPackets: string[];
    /** ЭР, покрытые активными пакетами (вес 0, производное) */
    ersInPacket: string[];
    /** LT-сервисы, входящие в комплект бесплатно */
    lt: string[];
    /** LT-сервисы сверх лимита — платный пакет по суммарному весу */
    ltInPacket: string[];
    /** Бесплатные блоки */
    freeBlocks: string[];
    /** Платный консалтинг: sovex | pkpremium | null (hotline всегда включён) */
    consalting: string | null;
    star: boolean;
    /** Код пакета академии или null */
    academy: string | null;
    /** Регионы в составе (codes, каждый +0.5 веса) */
    regions: string[];
}

export interface CompositionCtx {
    complect: KComplect;
    catalog: Catalog;
}

export interface RuleViolation {
    /** Машинный код нарушения (для тестов и UI) */
    code: string;
    message: string;
}

export interface RuleResult {
    composition: Composition;
    violations: RuleViolation[];
    /** Человекочитаемые описания автокоррекций (rules-режим) */
    autoFixes: string[];
}

export type CompositionAction =
    | { kind: 'toggleInfoblock'; code: string; checked: boolean }
    | { kind: 'toggleEr'; code: string; checked: boolean }
    | { kind: 'toggleErPacket'; code: string; checked: boolean }
    | { kind: 'toggleLt'; code: string; checked: boolean }
    | { kind: 'toggleFreeBlock'; code: string; checked: boolean }
    | { kind: 'setConsalting'; code: string | null }
    | { kind: 'toggleStar'; checked: boolean }
    | { kind: 'setAcademy'; code: string | null }
    | { kind: 'toggleRegion'; code: string; checked: boolean };

/** Состав по умолчанию из дефолтов комплекта каталога */
export const defaultComposition = (
    complect: KComplect,
    mode: CompositionMode = 'rules',
): Composition => ({
    complectCode: complect.code,
    mode,
    infoblocks: [...complect.defaults.infoblocks],
    ers: [...complect.defaults.ers],
    erPackets: [...complect.defaults.erPackets],
    ersInPacket: [...complect.defaults.ersInPacket],
    lt: [],
    ltInPacket: [],
    freeBlocks: [],
    consalting: null,
    star: false,
    academy: null,
    regions: [],
});
