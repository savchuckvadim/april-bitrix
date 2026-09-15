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
