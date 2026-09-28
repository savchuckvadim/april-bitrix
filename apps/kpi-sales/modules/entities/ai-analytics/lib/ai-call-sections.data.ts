import type { AiRopMarkSection } from '../model';

/*
 * Разделы рубрики разбора звонка (коды бэка CALL_REPORT_SECTIONS) —
 * единственный справочник названий: полные — из справочника разбора
 * (досье, рычаги, срезы), короткие — для тесных чипов (метка
 * руководителя). Сырые коды на экран не выводим; незнакомый — нейтрально.
 */

/** Коды разделов в порядке разговора. */
export const AI_CALL_SECTION_CODES = [
    'GREETING',
    'NEEDS',
    'PRESENTATION',
    'OBJECTIONS',
    'PRICE',
    'CLOSING',
    'REFUSAL',
] as const satisfies readonly AiRopMarkSection[];

export type AiCallSectionCode = (typeof AI_CALL_SECTION_CODES)[number];

/** Полные названия разделов из справочника разбора. */
export const AI_CALL_SECTION_LABELS: Record<AiCallSectionCode, string> = {
    GREETING: 'Приветствие',
    NEEDS: 'Выявление потребностей',
    PRESENTATION: 'Презентация под потребности',
    OBJECTIONS: 'Работа с возражениями',
    PRICE: 'Работа по цене',
    CLOSING: 'Закрытие разговора',
    REFUSAL: 'Поведение при отказах',
};

/** Короткие названия для чипов и чекбоксов формы метки. */
export const AI_CALL_SECTION_SHORT_LABELS: Record<AiCallSectionCode, string> = {
    GREETING: 'Приветствие',
    NEEDS: 'Потребности',
    PRESENTATION: 'Презентация',
    OBJECTIONS: 'Возражения',
    PRICE: 'Цена',
    CLOSING: 'Закрытие',
    REFUSAL: 'Отказ',
};

/** Незнакомый раздел рубрики — нейтрально, без кода. */
export const AI_CALL_SECTION_FALLBACK = 'другой раздел';

export const isAiCallSectionCode = (code: string): code is AiCallSectionCode =>
    Object.prototype.hasOwnProperty.call(AI_CALL_SECTION_LABELS, code);

/** Полное название раздела по коду; незнакомый код — «другой раздел». */
export const aiCallSectionLabel = (code: string): string =>
    isAiCallSectionCode(code)
        ? AI_CALL_SECTION_LABELS[code]
        : AI_CALL_SECTION_FALLBACK;

/** Короткое название раздела по коду; незнакомый код — «другой раздел». */
export const aiCallSectionShortLabel = (code: string): string =>
    isAiCallSectionCode(code)
        ? AI_CALL_SECTION_SHORT_LABELS[code]
        : AI_CALL_SECTION_FALLBACK;
