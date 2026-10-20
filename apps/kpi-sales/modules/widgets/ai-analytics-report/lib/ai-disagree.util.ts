import {
    AI_DISAGREE_REASON_MAX,
    clampAiDisagreeReason,
} from '@/modules/entities/ai-analytics/lib/ai-feedback.util';

/* ---------- «Не согласен»: причина из списка + комментарий ---------- */

/** Причины несогласия со строкой обзора; в feedback уходит одной строкой reason. */
export const AI_DISAGREE_REASONS = [
    { code: 'score', label: 'Оценка не соответствует звонкам' },
    { code: 'signal', label: 'Сигнал не по делу' },
    { code: 'type', label: 'Тип звонка определён неверно' },
    { code: 'data', label: 'Разобраны не все звонки' },
    { code: 'other', label: 'Другое' },
] as const;

export type AiDisagreeReasonCode = (typeof AI_DISAGREE_REASONS)[number]['code'];

export const isAiDisagreeReasonCode = (
    value: string,
): value is AiDisagreeReasonCode =>
    AI_DISAGREE_REASONS.some(reason => reason.code === value);

export const aiDisagreeReasonLabel = (
    code: AiDisagreeReasonCode | null,
): string | null =>
    code
        ? (AI_DISAGREE_REASONS.find(reason => reason.code === code)?.label ??
          null)
        : null;

/** Разделитель «Подпись: комментарий». */
const REASON_SEPARATOR = ': ';

/** Сколько символов остаётся комментарию, чтобы «подпись: комментарий» уложились в лимит. */
export const aiDisagreeCommentMax = (
    code: AiDisagreeReasonCode | null,
): number => {
    const label = aiDisagreeReasonLabel(code);
    return label
        ? Math.max(
              0,
              AI_DISAGREE_REASON_MAX - label.length - REASON_SEPARATOR.length,
          )
        : AI_DISAGREE_REASON_MAX;
};

export const clampAiDisagreeComment = (
    code: AiDisagreeReasonCode | null,
    value: string,
): string => {
    const max = aiDisagreeCommentMax(code);
    return value.length > max ? value.slice(0, max) : value;
};

/** Причина для feedback: «Подпись: комментарий» | подпись | комментарий; пусто — undefined. */
export const composeAiDisagreeReason = (
    code: AiDisagreeReasonCode | null,
    comment: string,
): string | undefined => {
    const label = aiDisagreeReasonLabel(code);
    const text = clampAiDisagreeComment(code, comment).trim();
    const joined =
        label && text ? `${label}${REASON_SEPARATOR}${text}` : (label ?? text);
    const result = clampAiDisagreeReason(joined).trim();
    return result.length ? result : undefined;
};

/** Счётчик комментария «введено / доступно». */
export const formatAiDisagreeCommentCounter = (
    code: AiDisagreeReasonCode | null,
    value: string,
): string =>
    `${clampAiDisagreeComment(code, value).length} / ${aiDisagreeCommentMax(code)}`;
