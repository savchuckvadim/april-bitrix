import type { AiFeedbackKind, AiRecommendationItem } from '../model';

/** Лимит длины причины «Не согласен» (зеркало ограничения бэка). */
export const AI_DISAGREE_REASON_MAX = 300;

/** Обрезка вводимой причины до лимита — для поля ввода и счётчика. */
export const clampAiDisagreeReason = (value: string): string =>
    value.length > AI_DISAGREE_REASON_MAX
        ? value.slice(0, AI_DISAGREE_REASON_MAX)
        : value;

/**
 * Причина для отправки: обрезана до лимита и без крайних пробелов;
 * пустая (или из одних пробелов) — undefined, реакция уходит без reason.
 */
export const normalizeAiDisagreeReason = (
    value: string | undefined,
): string | undefined => {
    const trimmed = clampAiDisagreeReason(value ?? '').trim();
    return trimmed.length ? trimmed : undefined;
};

/** Подпись счётчика «введено / лимит». */
export const formatAiDisagreeCounter = (value: string): string =>
    `${clampAiDisagreeReason(value).length} / ${AI_DISAGREE_REASON_MAX}`;

/* ---------- Ключи реакций, ошибки, режим просмотра ---------- */

/**
 * Канал реакции на объект: «полезно / не полезно» — взаимоисключающая
 * пара (одна подсветка на объект), остальные виды — каждый свой канал.
 */
export type AiFeedbackChannel =
    | 'rate'
    | Exclude<AiFeedbackKind, 'useful' | 'not_useful'>;

export const aiFeedbackChannel = (
    kind: AiFeedbackKind | AiFeedbackChannel,
): AiFeedbackChannel =>
    kind === 'useful' || kind === 'not_useful' ? 'rate' : kind;

/**
 * Ключ реакции в сторе (pending / sent / errors): канал + объект.
 * Автотелеметрия view по «pulse» не блокирует «пальцы» пульса, а
 * «Отработано» по call:<id> не мешает оценке той же строки повестки.
 */
export const aiFeedbackKey = (
    kind: AiFeedbackKind | AiFeedbackChannel,
    object: string,
): string => `${aiFeedbackChannel(kind)}|${object}`;

/** Подсказка к неактивным кнопкам в режиме «Смотреть как…». */
export const AI_FEEDBACK_VIEW_AS_HINT =
    'В режиме просмотра реакции не сохраняются';

/** Короткая ошибка у кнопки: «Не сохранилось: <текст сервера>». */
export const formatAiFeedbackError = (
    error: string | null | undefined,
): string | null => {
    const text = error?.trim();
    return text ? `Не сохранилось: ${text}` : null;
};

/** Срез стора реакций, нужный кнопкам (см. AiAnalyticsState.feedback). */
export interface AiFeedbackStoreSlice {
    pending: readonly string[];
    sent: Readonly<Record<string, AiFeedbackKind>>;
    errors: Readonly<Record<string, string>>;
}

/** Готовое состояние кнопок одного канала реакции по объекту. */
export interface AiFeedbackView {
    /** Последняя записанная реакция канала; null — ещё не было. */
    sent: AiFeedbackKind | null;
    pending: boolean;
    /** Кнопки неактивны: отправка идёт или режим «Смотреть как…». */
    disabled: boolean;
    /** Подсказка, почему кнопки неактивны; null — активны. */
    readOnlyHint: string | null;
    /** «Не сохранилось: …» у кнопки; null — ошибки нет. */
    error: string | null;
}

export const aiFeedbackView = (
    feedback: AiFeedbackStoreSlice,
    channel: AiFeedbackChannel,
    object: string,
    isViewAs: boolean,
): AiFeedbackView => {
    const key = aiFeedbackKey(channel, object);
    const pending = feedback.pending.includes(key);
    return {
        sent: feedback.sent[key] ?? null,
        pending,
        disabled: pending || isViewAs,
        readOnlyHint: isViewAs ? AI_FEEDBACK_VIEW_AS_HINT : null,
        error: formatAiFeedbackError(feedback.errors[key]),
    };
};

/* ---------- Подписи объектов реакций ---------- */

/** Префикс объекта (до первого «:») и хвост-идентификатор. */
const splitAiFeedbackObject = (
    object: string,
): { prefix: string; id: string } => {
    const index = object.indexOf(':');
    return index < 0
        ? { prefix: object, id: '' }
        : { prefix: object.slice(0, index), id: object.slice(index + 1) };
};

/** Неизвестный объект — без сырого кода. */
export const AI_FEEDBACK_OBJECT_OTHER = 'другой раздел витрины';

/** Вид совета словами (общие подписи витрины и объектов реакций). */
export const AI_LEVER_LABELS: Record<AiRecommendationItem['lever'], string> = {
    volume: 'Объём',
    quality: 'Качество',
    checklist: 'Чек-лист',
    pipeline: 'Сделки',
    objection: 'Возражение',
};

export const isAiLever = (
    value: string,
): value is AiRecommendationItem['lever'] =>
    Object.prototype.hasOwnProperty.call(AI_LEVER_LABELS, value);

/**
 * Совет по объекту «{id менеджера}:{ключ}», где ключ начинается с вида
 * совета: «по совету «Качество»»; вид не распознан — «по совету».
 */
const leverObjectLabel = (id: string): string => {
    const lever = id.split(':')[1] ?? '';
    return isAiLever(lever)
        ? `по совету «${AI_LEVER_LABELS[lever]}»`
        : 'по совету';
};

/**
 * Объект реакции по-человечески (блок «Несогласия недели»):
 * overview:<id> — «строка обзора», site-review:<id> — «отзыв с сайта по
 * разбору», call:<id> — «звонок» (id на экран не выводим), attention:… —
 * «сигнал «Внимания»».
 */
export const aiFeedbackObjectLabel = (object: string): string => {
    const { prefix, id } = splitAiFeedbackObject(object.trim());
    switch (prefix) {
        case 'pulse':
            return 'пульс дисциплины';
        case 'agenda':
            return 'повестка планёрки';
        case 'overview':
            return id ? 'строка обзора' : 'обзор';
        case 'call':
            return 'звонок';
        case 'attention':
            return 'сигнал «Внимания»';
        case 'site-review':
            return 'отзыв с сайта по разбору';
        case 'lever':
            return leverObjectLabel(id);
        default:
            return AI_FEEDBACK_OBJECT_OTHER;
    }
};
