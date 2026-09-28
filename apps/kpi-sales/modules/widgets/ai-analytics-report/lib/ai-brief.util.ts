import type { Tone } from '@workspace/april-ui';
import type {
    AiBrief,
    AiBriefSource,
    AiBriefTone,
    AiBriefUsage,
    AiJobStatus,
    AiOverviewFilters,
} from '@/modules/entities/ai-analytics';

/*
 * Чистая логика карточки «Итоги периода»: тон, причина шаблона под
 * итогами, текст ожидания очереди, стоимость подготовки и ключ периметра,
 * по смене которого карточка перезапрашивает. Группы пунктов и подпись
 * периода — ai-brief-view.util. Источник, расход и служебные версии на
 * экран не выводим.
 */

/** Тон итогов: подпись бэйджа и цвет. */
export const AI_BRIEF_TONE: Record<AiBriefTone, { label: string; tone: Tone }> =
    {
        calm: { label: 'спокойно', tone: 'success' },
        attention: { label: 'требует внимания', tone: 'warning' },
        alarm: { label: 'есть сигналы риска', tone: 'destructive' },
    };

/** Шаблон без названной причины (сервер reason не прислал). */
export const AI_BRIEF_TEMPLATE_REASON_FALLBACK = 'Итоги собраны по шаблону.';

export const isAiBriefTemplate = (source: AiBriefSource): boolean =>
    source === 'template';

/** Подпись причины шаблона: текст сервера, иначе общая. */
export const aiBriefTemplateReason = (
    reason: string | null | undefined,
): string => reason?.trim() || AI_BRIEF_TEMPLATE_REASON_FALLBACK;

/** Строка под итогами: причина шаблона; итоги от нейросети — null. */
export const aiBriefFooterReason = (
    brief: Pick<AiBrief, 'source' | 'reason'>,
): string | null =>
    isAiBriefTemplate(brief.source)
        ? aiBriefTemplateReason(brief.reason)
        : null;

export const AI_BRIEF_LOADING_TEXT = 'Собираем итоги…';
export const AI_BRIEF_QUEUED_TEXT =
    'Собираем итоги, готово будет через несколько секунд';

/** Текст ожидания: в очереди / считает — обещаем результат через секунды. */
export const aiBriefLoadingText = (jobStatus: AiJobStatus): string =>
    jobStatus ? AI_BRIEF_QUEUED_TEXT : AI_BRIEF_LOADING_TEXT;

/** Стоимость подготовки «1,20 ₽»; оценка — «около 1,20 ₽»; цены нет — null. */
export const formatAiBriefUsage = (
    usage: AiBriefUsage | undefined,
): string | null => {
    if (!usage || usage.price === null) return null;
    const price = usage.price.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${usage.estimated ? 'около ' : ''}${price} ₽`;
};

/** Строка подсказки «Стоимость подготовки: 1,20 ₽»; цены нет — null. */
export const aiBriefCostHint = (
    usage: AiBriefUsage | undefined,
): string | null => {
    const cost = formatAiBriefUsage(usage);
    return cost ? `Стоимость подготовки: ${cost}` : null;
};

/** Ключ периметра итогов (период + менеджеры): сменился — перезапрос. */
export const aiBriefScopeKey = (
    filters: AiOverviewFilters | null | undefined,
): string | null =>
    filters
        ? [filters.from, filters.to, (filters.managerIds ?? []).join(',')].join(
              '|',
          )
        : null;
