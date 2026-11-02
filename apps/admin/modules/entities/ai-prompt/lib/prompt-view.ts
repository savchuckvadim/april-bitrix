import {
    AI_PROMPT_TEXT,
    type LlmPromptRunResult,
    type LlmPromptTargetInfo,
    type LlmPromptUsage,
} from '../model';

/** Подпись исполнителя в селекте: недоступный — с причиной. */
export const targetLabel = (target: LlmPromptTargetInfo): string =>
    target.issue
        ? `${target.title} — ${AI_PROMPT_TEXT.unavailable(target.issue)}`
        : target.title;

/** Время ответа: до 10 с — с десятыми, дальше — целые секунды. */
export const formatElapsed = (ms: number): string => {
    const seconds = ms / 1000;
    return seconds < 10
        ? `${seconds.toFixed(1).replace('.', ',')} с`
        : `${Math.round(seconds)} с`;
};

/** Расход токенов одной строкой; null — провайдер его не отдал. */
export const formatUsage = (usage: LlmPromptUsage | null): string | null => {
    if (!usage || usage.totalTokens === null) return null;
    const parts = [`всего ${usage.totalTokens}`];
    if (usage.promptTokens !== null) parts.push(`запрос ${usage.promptTokens}`);
    if (usage.completionTokens !== null) {
        parts.push(`ответ ${usage.completionTokens}`);
    }
    return `Токены: ${parts.join(', ')}`;
};

/** Строки «кто ответил»: провайдер и модель, время, расход. */
export const resultMeta = (result: LlmPromptRunResult): string[] => {
    const who =
        result.model && result.model !== result.provider
            ? `${result.provider}, модель ${result.model}`
            : result.provider;
    const lines = [`Ответил: ${who}`, `Время: ${formatElapsed(result.elapsedMs)}`];
    const usage = formatUsage(result.usage);
    if (usage) lines.push(usage);
    return lines;
};

/**
 * Выбранный исполнитель стал недоступен (сменили портал — VibeCode без
 * портала) — первый доступный; все недоступны — оставляем как есть.
 */
export const fallbackTarget = (
    targets: readonly LlmPromptTargetInfo[],
    current: string,
): string => {
    const selected = targets.find(target => target.code === current);
    if (selected && !selected.issue) return current;
    return targets.find(target => !target.issue)?.code ?? current;
};
