import type { Tone } from '@workspace/april-ui';
import {
    formatAiCount,
    pluralRu,
    type AiBriefSource,
    type AiBriefTone,
    type AiBriefUsage,
    type AiJobStatus,
    type AiOverviewFilters,
} from '@/modules/entities/ai-analytics';

/*
 * Чистая логика карточки «AI-резюме периода»: тон и источник резюме,
 * подпись причины шаблона, текст ожидания очереди, расход модели, коды
 * фактов и ключ периметра, по смене которого карточка перезапрашивает.
 */

/** Тон резюме: подпись бэйджа и цвет. */
export const AI_BRIEF_TONE: Record<AiBriefTone, { label: string; tone: Tone }> =
    {
        calm: { label: 'спокойно', tone: 'success' },
        attention: { label: 'требует внимания', tone: 'warning' },
        alarm: { label: 'есть алерты', tone: 'destructive' },
    };

/** Источник резюме: ответ модели после факт-чека либо шаблон по фактам. */
export const AI_BRIEF_SOURCE: Record<AiBriefSource, string> = {
    llm: 'модель',
    template: 'шаблон',
};

/** Шаблон без названной причины (сервер reason не прислал). */
export const AI_BRIEF_TEMPLATE_REASON_FALLBACK =
    'Резюме собрано шаблоном по фактам пакета';

export const isAiBriefTemplate = (source: AiBriefSource): boolean =>
    source === 'template';

/** Подпись причины шаблона: текст сервера, иначе общая. */
export const aiBriefTemplateReason = (
    reason: string | null | undefined,
): string => reason?.trim() || AI_BRIEF_TEMPLATE_REASON_FALLBACK;

export const AI_BRIEF_LOADING_TEXT = 'Собираем резюме…';
export const AI_BRIEF_QUEUED_TEXT =
    'Собираем резюме, готово будет через несколько секунд';

/** Текст ожидания: в очереди / считает — обещаем результат через секунды. */
export const aiBriefLoadingText = (jobStatus: AiJobStatus): string =>
    jobStatus ? AI_BRIEF_QUEUED_TEXT : AI_BRIEF_LOADING_TEXT;

const TOKEN_FORMS = ['токен', 'токена', 'токенов'] as const;

/** Расход вызова «800 токенов · 1,20 ₽»; оценка — с «≈»; модель не вызывали — null. */
export const formatAiBriefUsage = (
    usage: AiBriefUsage | undefined,
): string | null => {
    if (!usage) return null;
    const parts: string[] = [];
    if (usage.tokens !== null) {
        parts.push(
            `${formatAiCount(usage.tokens)} ${pluralRu(usage.tokens, TOKEN_FORMS)}`,
        );
    }
    if (usage.price !== null) {
        parts.push(
            `${usage.price.toLocaleString('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })} ₽`,
        );
    }
    if (!parts.length) return null;
    return `${usage.estimated ? '≈ ' : ''}${parts.join(' · ')}`;
};

/** Коды фактов буллета «alerts · funnel_gap»; пусто — ''. */
export const formatAiBriefFactRefs = (refs: readonly string[]): string =>
    refs.filter(Boolean).join(' · ');

/** Ключ периметра резюме (период + менеджеры): сменился — перезапрос. */
export const aiBriefScopeKey = (
    filters: AiOverviewFilters | null | undefined,
): string | null =>
    filters
        ? [filters.from, filters.to, (filters.managerIds ?? []).join(',')].join(
              '|',
          )
        : null;
