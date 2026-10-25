import type { Catalog, KComplect } from '../../catalog';

/**
 * Состав (наполнение) комплекта. В отличие от легаси — НЕ синглтон:
 * привязывается к конкретной garant-строке любого сета (KRow.composition).
 * Вся адресация — по code.
 */

export type CompositionMode = 'rules' | 'free';

/**
 * Дополнительный платный пакет Legal Tech (легаси IOtherLtPack, modules/
 * legal-tech-other): произвольный набор LT-сервисов, пакет подбирается по
 * суммарному весу (2/4/5/10). Живёт в наполнении строки — строка lt_other
 * в сете производна от него (как LT-пакет от ltInPacket).
 */
export interface LtOtherPacket {
    /** Стабильный ключ пакета (nanoid) — он же ключ строки в сете */
    id: string;
    /** Коды LT-сервисов пакета */
    services: string[];
    /** Своё название вместо имени пакета каталога (легаси alternativePacketName) */
    alternativeName: string | null;
}

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
    /** Дополнительные пакеты LT (легаси LT Other) — по строке lt_other на каждый */
    ltOther: LtOtherPacket[];
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
    /**
     * Текущий регион сборки: тумблер рутового блока «Региональное
     * законодательство» добавляет/снимает именно его (легаси
     * onRegionInfoblockChange). Без региона тумблер трогает только блок.
     */
    regionCode?: string | null;
    /**
     * Сборка ведётся сервисным отделом: ему доступен средний пакет LT-other
     * (вес 4), отделу продаж — нет (легаси getCurrentPacksgeByServices).
     */
    serviceDepartment?: boolean;
}

export type RuleViolationLevel = 'error' | 'warning';

export interface RuleViolation {
    /** Машинный код нарушения (для тестов и UI) */
    code: string;
    message: string;
    /** error (по умолчанию) — в rules-режиме блокирует; warning — только подсветка */
    level?: RuleViolationLevel;
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
    | { kind: 'toggleRegion'; code: string; checked: boolean }
    | { kind: 'addLtOtherPacket'; id: string }
    | { kind: 'removeLtOtherPacket'; id: string }
    | { kind: 'toggleLtOtherService'; id: string; code: string; checked: boolean }
    | { kind: 'renameLtOtherPacket'; id: string; name: string | null };

export type CompositionActionKind = CompositionAction['kind'];

/**
 * Единый контракт правила (этап 5.1). Правило — отдельный файл с тестом:
 * `apply` обрабатывает свои действия (null — «не моё действие»), `validate` —
 * сквозная проверка состава после любого действия (подсветка, в rules-режиме
 * ошибки уровня error блокируют). Реестр — lib/rules/registry.ts.
 */
export interface Rule {
    code: string;
    /** Действия, которые правило применяет; пусто — только валидация */
    actions: readonly CompositionActionKind[];
    apply?: (
        composition: Composition,
        action: CompositionAction,
        ctx: CompositionCtx,
    ) => RuleResult | null;
    validate?: (composition: Composition, ctx: CompositionCtx) => RuleViolation[];
}

export const violation = (
    code: string,
    message: string,
    level: RuleViolationLevel = 'error',
): RuleViolation => ({ code, message, level });

export const isBlocking = (item: RuleViolation): boolean =>
    (item.level ?? 'error') === 'error';

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
    ltOther: [],
    freeBlocks: [],
    consalting: null,
    star: false,
    academy: null,
    regions: [],
});

/**
 * Состав из слепка, записанного до появления поля (v2 без ltOther и т.п.):
 * недостающие списки получают пустое значение, остальное — как есть.
 */
export const normalizeComposition = (
    composition: Composition,
): Composition =>
    Array.isArray(composition.ltOther)
        ? composition
        : { ...composition, ltOther: [] };
