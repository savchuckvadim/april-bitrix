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
    event_invite: 'Мероприятие',
    other: 'Прочее',
    irrelevant: 'Нерелевантный',
};

export const AI_OBJECTIONS_LABEL = 'Возражения';
/** «Все типы»: в переключателе — коротко, в шапке и подписях — полностью. */
export const AI_ALL_TYPES_OPTION_LABEL = 'Все';
export const AI_ALL_TYPES_LABEL = 'Все типы';

/**
 * Порядок подвкладок типов; other/irrelevant в переключатель не попадают.
 * Приглашение на мероприятие — отдельная колонка (решение владельца
 * 19.10.2026): свои разборы и оценка, но в среднюю оценку не входит.
 */
export const AI_CALL_TYPE_ORDER: AiCallTypeCode[] = [
    'cold',
    'site_lead',
    'call',
    'presentation',
    'refine',
    'decision',
    'payment',
    'event_invite',
];

/** Подсказка у типа, который считается отдельно и в среднюю оценку не входит. */
export const AI_CALL_TYPE_OUTSIDE_SCORE_HINT =
    'Не входит в среднюю оценку; считается отдельно';
/** Короткая пометка той же подсказки — в шапку CSV и к итогам по типам. */
export const AI_CALL_TYPE_OUTSIDE_SCORE_SHORT = 'вне средней оценки';

/** Фолбэк без карты портала: типы со своей колонкой, но вне средней оценки. */
const AI_CALL_TYPES_OUTSIDE_SCORE: readonly AiCallTypeCode[] = ['event_invite'];

/** Гард кода AI-типа звонка (ключ фолбэк-подписей). */
export const isAiCallTypeCode = (value: unknown): value is AiCallTypeCode =>
    typeof value === 'string' && value in AI_CALL_TYPE_LABELS;

/**
 * Тип считается отдельной колонкой, но в среднюю оценку не входит: по карте
 * портала — корзины нет, а колонка есть (у «прочего» колонки нет, оно в
 * сводке долей); без карты или без признака колонки — фолбэк по коду.
 */
export const isAiCallTypeOutsideScore = (
    code: string | null | undefined,
    callTypes: AiCallType[] = [],
): boolean => {
    if (!code) return false;
    const fallback =
        isAiCallTypeCode(code) && AI_CALL_TYPES_OUTSIDE_SCORE.includes(code);
    const fromPortal = callTypes.find(item => item.code === code);
    if (!fromPortal) return fallback;
    return fromPortal.bucket === null && (fromPortal.column ?? fallback);
};

/** Подсказка «вне средней оценки» для такого типа; иначе null. */
export const aiCallTypeScoreHint = (
    code: string | null | undefined,
    callTypes: AiCallType[] = [],
): string | null =>
    isAiCallTypeOutsideScore(code, callTypes)
        ? AI_CALL_TYPE_OUTSIDE_SCORE_HINT
        : null;

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
