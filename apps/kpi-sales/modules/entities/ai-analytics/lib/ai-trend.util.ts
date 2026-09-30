import type { Tone } from '@workspace/april-ui';
import type {
    AiGoodhartFlag,
    AiManagerTrends,
    AiTrendSignal,
    AiTrendSignalKind,
} from '../model';
import { aiIsoWeekRange, formatAiMonthLabelRange } from './ai-period-label.util';

/*
 * Тренды строки менеджера и флаги «показатель растёт, результат — нет»:
 * подписи показателей и видов сигнала, стрелки направления, формат величин.
 * Слова нейтральные: тренд — факт о ряде, не оценка человека. Недели и
 * месяцы — датами, не ключами бэка.
 */

/** Подписи показателей рядов: недельные, корзины, рёбра воронки (edge_*). */
export const AI_TREND_METRIC_LABELS: Record<string, string> = {
    quality: 'оценка',
    volume: 'число разборов',
    bucket_contact: 'оценка контакта',
    bucket_presentation: 'оценка презентации',
    bucket_closing: 'оценка закрытия',
    edge_call_to_presentation: 'доля презентаций после звонков',
    edge_presentation_to_offer: 'доля КП после презентаций',
    edge_offer_to_invoice: 'доля счетов после КП',
    edge_invoice_to_sale: 'доля продаж после счетов',
};

/** Подпись незнакомого показателя — нейтрально, без кода. */
export const AI_TREND_METRIC_UNKNOWN = 'показатель';

/** Подпись показателя; незнакомый код — «показатель». */
export const aiTrendMetricLabel = (metric: string): string =>
    AI_TREND_METRIC_LABELS[metric] ?? AI_TREND_METRIC_UNKNOWN;

/** Вид сигнала: подпись и тон бэйджа. */
export const AI_TREND_KIND: Record<
    AiTrendSignalKind,
    { label: string; tone: Tone }
> = {
    shift: { label: 'сдвиг', tone: 'warning' },
    drift: { label: 'дрейф', tone: 'info' },
    outlier: { label: 'выброс', tone: 'muted' },
};

/** Стрелка направления сигнала. */
export const aiTrendArrow = (direction: AiTrendSignal['direction']): string =>
    direction === 'up' ? '↑' : '↓';

/** Величина сигнала в единицах показателя: доли рёбер — в п.п., остальное — как есть. */
export const formatAiTrendMagnitude = (signal: AiTrendSignal): string => {
    const sign = signal.magnitude > 0 ? '+' : '−';
    const abs = Math.abs(signal.magnitude);
    if (signal.metric.startsWith('edge_')) {
        return `${sign}${Math.round(abs * 100)} п.п.`;
    }
    return `${sign}${abs.toFixed(1).replace('.', ',')}`;
};

/** Строка сигнала: «оценка ↓ сдвиг −0,8 с недели 27.07–02.08»; битая неделя — без хвоста. */
export const formatAiTrendSignal = (signal: AiTrendSignal): string => {
    const week = aiIsoWeekRange(signal.sinceWeek);
    return (
        `${aiTrendMetricLabel(signal.metric)} ${aiTrendArrow(signal.direction)} ` +
        `${AI_TREND_KIND[signal.kind].label} ${formatAiTrendMagnitude(signal)}` +
        (week ? ` с недели ${week}` : '')
    );
};

/** Тон ячейки трендов: сдвиг вниз — warning, дрейф вниз — info, иначе muted. */
export const aiTrendsTone = (trends: AiManagerTrends): Tone => {
    const down = trends.signals.filter(signal => signal.direction === 'down');
    if (down.some(signal => signal.kind === 'shift')) return 'warning';
    if (down.some(signal => signal.kind === 'drift')) return 'info';
    return 'muted';
};

/** Проценты изменения флага: «+50 %», «−36 %». */
export const formatAiGoodhartChange = (change: number): string =>
    `${change > 0 ? '+' : '−'}${Math.round(Math.abs(change) * 100)} %`;

/** Строка флага: «число разборов +50 %, оценка −36 % за 3 мес. (июнь – август 2026)». */
export const formatAiGoodhartFlag = (flag: AiGoodhartFlag): string =>
    `${aiTrendMetricLabel(flag.pressure)} ${formatAiGoodhartChange(flag.pressureChange)}, ` +
    `${aiTrendMetricLabel(flag.counter)} ${formatAiGoodhartChange(flag.counterChange)} ` +
    `за ${flag.points} мес. (${formatAiMonthLabelRange(flag.fromKey, flag.toKey)})`;

/** Строки подсказки ячейки трендов: сигналы, затем флаги «показатель растёт, результат — нет». */
export const aiTrendsHintLines = (trends: AiManagerTrends): string[] => {
    const lines = trends.signals.map(formatAiTrendSignal);
    for (const flag of trends.goodhart ?? []) {
        lines.push(`показатель растёт, результат — нет: ${formatAiGoodhartFlag(flag)}`);
    }
    if (lines.length === 0) {
        lines.push('Ряды спокойны: сдвигов и дрейфов за окно нет.');
    }
    const week = aiIsoWeekRange(trends.weekKey);
    lines.push(
        `Посчитано на неделе ${week ?? '—'} · разборов в окне ${trends.calls} · ` +
            `сравнимых недель ${trends.weeks}`,
    );
    return lines;
};
