import type { KComplect } from '../model/types';

/**
 * Флаги правил формирования комплекта (решение владельца 11: источник —
 * БД/админка, связи комплект ↔ инфоблоки уже в init; флаги добавляются к
 * ним). До миграции — эта таблица по `code`; правила читают ТОЛЬКО через
 * getComplectRuleFlags(), поэтому переезд в init сведётся к замене источника.
 * Легаси держал те же знания россыпью кодов/титулов внутри complect-utils.js.
 */
export interface ComplectRuleFlags {
    /** Минимум бесплатных LT (Офис, Эксперт в закупках: 5); сверх — платно, ниже — поднимаем из пакета */
    minFreeLt?: number;
    /** Ровно столько бесплатных LT (обычные PROF: 2) — сверх платно, ниже нельзя */
    exactFreeLt?: number;
    /** Ровно столько пакетов ЭР (Офис: 2) */
    erPacketsRequired?: number;
    /** LT-сервис, который остаётся при опустошении (Эксперт PRO: ltdisk) */
    keepLtCode?: string;
    /** Инфоблоки, которые нельзя снять (legacy noChanged) */
    noChanged?: readonly string[];
    /** СТАР встроен в комплект: не переключается, строка бесплатна */
    withStar?: boolean;
    /** Вес состава допустим ≥ эталонного (Максимум) */
    weightAtLeast?: boolean;
}

const DEFAULT_PROF_FLAGS: ComplectRuleFlags = { exactFreeLt: 2 };
const DEFAULT_UNIVERSAL_FLAGS: ComplectRuleFlags = {};

/** Переопределения по коду комплекта (поверх дефолтов линейки). */
export const COMPLECT_RULE_FLAGS: Record<string, ComplectRuleFlags> = {
    office: { minFreeLt: 5, erPacketsRequired: 2 },
    expert: { exactFreeLt: 2, keepLtCode: 'ltdisk' },
    exzak: {
        minFreeLt: 5,
        withStar: true,
        noChanged: ['rus', 'reg', 'fac', 'lencyc', 'eforms'],
    },
    exbuild: { exactFreeLt: 2, noChanged: ['rus', 'buildspec'] },
    maximum: { weightAtLeast: true },
};

export const getComplectRuleFlags = (
    complect: Pick<KComplect, 'code' | 'type'>,
): ComplectRuleFlags => ({
    ...(complect.type === 'prof' ? DEFAULT_PROF_FLAGS : DEFAULT_UNIVERSAL_FLAGS),
    ...COMPLECT_RULE_FLAGS[complect.code],
});
