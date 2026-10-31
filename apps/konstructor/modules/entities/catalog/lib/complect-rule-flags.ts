import type { KComplect } from '../model/types';

/**
 * Флаги правил формирования комплекта (решение владельца 11: источник —
 * БД/админка, связи комплект ↔ инфоблоки уже в init; флаги добавляются к
 * ним). До миграции — эта таблица по `code`; правила читают ТОЛЬКО через
 * getComplectRuleFlags(), поэтому переезд в init сведётся к замене источника.
 * Легаси держал те же знания россыпью кодов/титулов внутри complect-utils.js.
 * Лимит бесплатных LT здесь не задаётся: он равен весу LT, привязанного к
 * комплекту в админке (ltFreeLimit).
 */
export interface ComplectRuleFlags {
    /** Ровно столько пакетов ЭР (Офис: 2) */
    erPacketsRequired?: number;
    /** LT-сервис, который снять нельзя (Эксперт PRO: ltdisk) */
    pinnedLt?: string;
    /** LT комплекта ставится по умолчанию платно: бесплатных мест нет (Охрана труда) */
    ltDefaultsPaid?: boolean;
    /** Инфоблоки, которые нельзя снять (legacy noChanged) */
    noChanged?: readonly string[];
    /** СТАР встроен в комплект: не переключается, строка бесплатна */
    withStar?: boolean;
    /** Вес состава допустим ≥ эталонного (Максимум) */
    weightAtLeast?: boolean;
}

/** Переопределения по коду комплекта. */
export const COMPLECT_RULE_FLAGS: Record<string, ComplectRuleFlags> = {
    office: { erPacketsRequired: 2 },
    expert: { pinnedLt: 'ltdisk' },
    exzak: {
        withStar: true,
        noChanged: ['rus', 'reg', 'fac', 'lencyc', 'eforms'],
    },
    exbuild: { noChanged: ['rus', 'buildspec'] },
    exjobsec: { ltDefaultsPaid: true },
    maximum: { weightAtLeast: true },
};

export const getComplectRuleFlags = (
    complect: Pick<KComplect, 'code'>,
): ComplectRuleFlags => COMPLECT_RULE_FLAGS[complect.code] ?? {};
