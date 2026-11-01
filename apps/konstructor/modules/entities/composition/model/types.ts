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

/** Где лежит LT-сервис основного списка: бесплатно в комплекте или в платном пакете */
export type LtPlacement = 'included' | 'paid';

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
    /** Своя подпись сервиса в документах по коду (легаси iskraConfig: Искра) */
    ltSubtitles?: Record<string, string>;
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
    /**
     * Срок сделки в месяцах (количество × длительность договора): пакет
     * академии «на срок» должен совпадать с ним. null/undefined — неизвестен.
     */
    termMonths?: number | null;
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
    | { kind: 'moveLt'; code: string; to: LtPlacement }
    | { kind: 'setLtSubtitle'; code: string; subtitle: string | null }
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
    lt: [...complect.defaults.lt],
    ltInPacket: [...complect.defaults.ltInPacket],
    ltOther: [],
    freeBlocks: [...complect.defaults.freeBlocks],
    consalting: null,
    star: complect.defaults.star,
    academy: null,
    regions: [],
});

/**
 * Состав из старого слепка v2: недостающие списки получают пустое значение,
 * пакеты убираются из отдельных ЭР (раньше init клал их и туда — вес считался
 * дважды), состав пакетов — без повторов.
 */
export const normalizeComposition = (
    composition: Composition,
): Composition => ({
    ...composition,
    ltOther: Array.isArray(composition.ltOther) ? composition.ltOther : [],
    ers: composition.ers.filter(code => !composition.erPackets.includes(code)),
    ersInPacket: [...new Set(composition.ersInPacket)],
});
