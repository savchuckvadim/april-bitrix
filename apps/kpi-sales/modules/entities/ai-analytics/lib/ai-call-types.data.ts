import type { Tone } from '@workspace/april-ui';
import type { AiByTypeCallType, AiCallType, AiCallTypeCode } from '../model';

/**
 * Подвкладки разбора по типам звонков. Реальные типы приходят с бэка
 * (settings.callTypes — карта алфавитов); здесь фолбэк-подписи, порядок
 * и два служебных значения: «все» — все типы вместе (бэк отдаёт строку
 * на каждую пару менеджер × тип) и «возражения» — сквозной срез, не тип.
 */
export const AI_CALL_TYPE_ALL = 'all';
export const AI_CALL_TYPE_OBJECTIONS = 'objections';

export type AiCallTypeSelection =
    | AiCallTypeCode
    | typeof AI_CALL_TYPE_ALL
    | typeof AI_CALL_TYPE_OBJECTIONS;

/** Фолбэк-подписи AI-типов звонков (источник истины — settings.callTypes). */
export const AI_CALL_TYPE_LABELS: Record<AiCallTypeCode, string> = {
    cold: 'Холодный',
    site_lead: 'Сайт',
    call: 'Звонок',
    presentation: 'Презентация',
    refine: 'Доработка',
    decision: 'Решение',
    payment: 'Оплата',
    other: 'Прочее',
    irrelevant: 'Нерелевантный',
};

export const AI_OBJECTIONS_LABEL = 'Возражения';
/** «Все типы»: в переключателе — коротко, в шапке и подписях — полностью. */
export const AI_ALL_TYPES_OPTION_LABEL = 'Все';
export const AI_ALL_TYPES_LABEL = 'Все типы';

/** Порядок подвкладок типов; other/irrelevant в переключатель не попадают. */
export const AI_CALL_TYPE_ORDER: AiCallTypeCode[] = [
    'cold',
    'site_lead',
    'call',
    'presentation',
    'refine',
    'decision',
    'payment',
];

/** Гард кода AI-типа звонка (ключ фолбэк-подписей). */
export const isAiCallTypeCode = (value: unknown): value is AiCallTypeCode =>
    typeof value === 'string' && value in AI_CALL_TYPE_LABELS;

/** Срез by-type в режиме «все типы» (строки на пары менеджер × тип). */
export const isAiByTypeAll = (callType: string | null | undefined): boolean =>
    callType === AI_CALL_TYPE_ALL;

/** Подпись типа звонка: служебные значения, с бэка, иначе фолбэк, иначе код. */
export const aiCallTypeLabel = (
    code: string | null | undefined,
    callTypes: AiCallType[] = [],
): string => {
    if (!code) return '—';
    if (code === AI_CALL_TYPE_ALL) return AI_ALL_TYPES_LABEL;
    if (code === AI_CALL_TYPE_OBJECTIONS) return AI_OBJECTIONS_LABEL;
    const fromPortal = callTypes.find(item => item.code === code)?.title;
    if (fromPortal) return fromPortal;
    return isAiCallTypeCode(code) ? AI_CALL_TYPE_LABELS[code] : code;
};

/** Тон бэйджа типа звонка (реестр tones april-ui; с бэка — как есть). */
export const aiCallTypeTone = (
    code: string | null | undefined,
    callTypes: AiCallType[] = [],
): Tone => callTypes.find(item => item.code === code)?.tone ?? 'neutral';

/**
 * Опции подвкладок разбора: «Все» первой, затем типы портала в
 * фиксированном порядке, замыкают «Возражения».
 */
export const buildAiCallTypeOptions = (
    callTypes: AiCallType[],
): { value: AiCallTypeSelection; label: string }[] => {
    const known = callTypes.filter(item =>
        AI_CALL_TYPE_ORDER.includes(item.code),
    );
    const source = known.length
        ? [...known].sort(
              (a, b) =>
                  AI_CALL_TYPE_ORDER.indexOf(a.code) -
                  AI_CALL_TYPE_ORDER.indexOf(b.code),
          )
        : AI_CALL_TYPE_ORDER.map(code => ({
              code,
              title: AI_CALL_TYPE_LABELS[code],
          }));
    return [
        { value: AI_CALL_TYPE_ALL, label: AI_ALL_TYPES_OPTION_LABEL },
        ...source.map(item => ({ value: item.code, label: item.title })),
        { value: AI_CALL_TYPE_OBJECTIONS, label: AI_OBJECTIONS_LABEL },
    ];
};

/** Гард для значений из ui-settings blob (могли протухнуть). */
export const isAiCallTypeSelection = (
    value: unknown,
): value is AiCallTypeSelection =>
    value === AI_CALL_TYPE_ALL ||
    value === AI_CALL_TYPE_OBJECTIONS ||
    isAiCallTypeCode(value);

/**
 * Что запрашивать у by-type: выбор подвкладки уходит как есть — «все»
 * и «возражения» бэк принимает наравне с кодами типов. Единственная точка
 * перехода от выбора в UI к значению запроса.
 */
export const resolveAiByTypeCallType = (
    selection: AiCallTypeSelection,
): AiByTypeCallType => selection;
