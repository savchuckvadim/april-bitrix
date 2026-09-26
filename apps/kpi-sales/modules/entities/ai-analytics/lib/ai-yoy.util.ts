import type { Tone } from '@workspace/april-ui';
import type { AiYoy, AiYoyMetric, AiYoyMetricCode } from '../model';
import { formatAiMoneyCompact } from './ai-finance.util';
import { formatAiScore } from './ai-score.util';

/*
 * Блок «год назад» (Фаза 3, П3): подписи величин и причин несопоставимости,
 * формат значений и разницы. Только описательно — «лучше/хуже» здесь нет.
 */

/** Величина сравнения: подпись и форматтер. */
export const AI_YOY_METRIC: Record<
    AiYoyMetricCode,
    { label: string; format: (value: number) => string }
> = {
    quality: { label: 'оценка', format: formatAiScore },
    analyzed_calls: { label: 'разборов', format: value => String(value) },
    sales_count: { label: 'продаж', format: value => String(value) },
    sales_sum: { label: 'сумма продаж', format: formatAiMoneyCompact },
    average_check: { label: 'средний чек', format: formatAiMoneyCompact },
};

/** Причины несопоставимости пары периодов (коды бэка) по-русски. */
export const AI_YOY_REASON_LABELS: Record<string, string> = {
    'period-not-month': 'период витрины — не месяц',
    'no-history': 'снапшота год назад нет',
    'versions-changed': 'сменились версии разбора',
    'before-comparable': 'граница сравнимой истории прошла внутри года',
    'department-changed': 'год назад менеджер был в другом отделе',
    'level-changed': 'год назад у менеджера был другой уровень',
    'tenure-band-changed': 'год назад менеджер был в другой полосе стажа',
    'portal-event': 'между периодами есть событие журнала портала',
};

export const aiYoyReasonLabel = (code: string): string =>
    AI_YOY_REASON_LABELS[code] ?? code;

/** Значение величины; null — «мало данных». */
export const formatAiYoyValue = (
    metric: AiYoyMetric,
    value: number | null,
): string => (value === null ? 'мало данных' : AI_YOY_METRIC[metric.metric].format(value));

/** Разница со знаком в единицах величины; null — прочерк. */
export const formatAiYoyDelta = (metric: AiYoyMetric): string => {
    if (metric.delta === null) return '—';
    const sign = metric.delta > 0 ? '+' : metric.delta < 0 ? '−' : '';
    return `${sign}${AI_YOY_METRIC[metric.metric].format(Math.abs(metric.delta))}`;
};

/** Строка величины: «оценка: 7,1 (год назад 6,4, +0,7)». */
export const formatAiYoyLine = (metric: AiYoyMetric): string =>
    `${AI_YOY_METRIC[metric.metric].label}: ${formatAiYoyValue(metric, metric.current.value)} ` +
    `(год назад ${formatAiYoyValue(metric, metric.base.value)}, ${formatAiYoyDelta(metric)})`;

/** Тон бэйджа: сопоставимо — success, с оговорками — warning. */
export const aiYoyTone = (yoy: AiYoy): Tone =>
    yoy.comparable ? 'success' : 'warning';

/** Подпись бэйджа «год назад»: короткая разница оценки либо число величин. */
export const aiYoyBadgeLabel = (yoy: AiYoy): string => {
    const quality = yoy.metrics.find(metric => metric.metric === 'quality');
    if (quality) {
        return quality.delta === null
            ? 'год назад: оценка — мало данных'
            : `год назад: оценка ${formatAiYoyDelta(quality)}`;
    }
    return `год назад: ${yoy.metrics.length} величин`;
};

/** Строки подсказки: величины, затем причины несопоставимости. */
export const aiYoyHintLines = (yoy: AiYoy): string[] => [
    ...yoy.metrics.map(formatAiYoyLine),
    ...(yoy.comparable
        ? ['Периоды сопоставимы: версии, состав и уровень те же.']
        : yoy.reasons.map(code => `оговорка: ${aiYoyReasonLabel(code)}`)),
    `${yoy.periodKey} против ${yoy.basePeriodKey}`,
];
