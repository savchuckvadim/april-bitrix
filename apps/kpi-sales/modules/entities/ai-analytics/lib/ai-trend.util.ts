import type { Tone } from '@workspace/april-ui';
import type {
    AiGoodhartFlag,
    AiManagerTrends,
    AiTrendSignal,
    AiTrendSignalKind,
} from '../model';

/*
 * Тренды строки менеджера (Фаза 3, П1) и флаги детектора Гудхарта (П9):
 * подписи метрик и видов сигнала, стрелки направления, формат величин.
 * Слова нейтральные: тренд — факт о ряде, не оценка человека.
 */

/** Подписи метрик рядов: недельные, корзины, рёбра воронки (edge_*). */
export const AI_TREND_METRIC_LABELS: Record<string, string> = {
    quality: 'оценка',
    volume: 'разборов',
    bucket_contact: 'оценка контакта',
    bucket_presentation: 'оценка презентации',
    bucket_closing: 'оценка закрытия',
    edge_call_to_presentation: 'звонок → презентация',
    edge_presentation_to_offer: 'презентация → КП',
    edge_offer_to_invoice: 'КП → счёт',
    edge_invoice_to_sale: 'счёт → продажа',
};

/** Подпись метрики; незнакомый код — как есть. */
export const aiTrendMetricLabel = (metric: string): string =>
    AI_TREND_METRIC_LABELS[metric] ?? metric;

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

/** Величина сигнала в единицах метрики: доли рёбер — в п.п., остальное — как есть. */
export const formatAiTrendMagnitude = (signal: AiTrendSignal): string => {
    const sign = signal.magnitude > 0 ? '+' : '−';
    const abs = Math.abs(signal.magnitude);
    if (signal.metric.startsWith('edge_')) {
        return `${sign}${Math.round(abs * 100)} п.п.`;
    }
    return `${sign}${abs.toFixed(1).replace('.', ',')}`;
};

/** Строка сигнала: «оценка ↓ сдвиг −0,8 с 2026-W31». */
export const formatAiTrendSignal = (signal: AiTrendSignal): string =>
    `${aiTrendMetricLabel(signal.metric)} ${aiTrendArrow(signal.direction)} ` +
    `${AI_TREND_KIND[signal.kind].label} ${formatAiTrendMagnitude(signal)} ` +
    `с ${signal.sinceWeek}`;

/** Тон ячейки трендов: сдвиг вниз — warning, дрейф вниз — info, иначе muted. */
export const aiTrendsTone = (trends: AiManagerTrends): Tone => {
    const down = trends.signals.filter(signal => signal.direction === 'down');
    if (down.some(signal => signal.kind === 'shift')) return 'warning';
    if (down.some(signal => signal.kind === 'drift')) return 'info';
    return 'muted';
};

/** Проценты изменения флага Гудхарта: «+50 %», «−36 %». */
export const formatAiGoodhartChange = (change: number): string =>
    `${change > 0 ? '+' : '−'}${Math.round(Math.abs(change) * 100)} %`;

/** Строка флага: «разборов +50 %, оценка −36 % за 3 мес. (2026-06 – 2026-08)». */
export const formatAiGoodhartFlag = (flag: AiGoodhartFlag): string =>
    `${aiTrendMetricLabel(flag.pressure)} ${formatAiGoodhartChange(flag.pressureChange)}, ` +
    `${aiTrendMetricLabel(flag.counter)} ${formatAiGoodhartChange(flag.counterChange)} ` +
    `за ${flag.points} мес. (${flag.fromKey} – ${flag.toKey})`;

/** Строки подсказки ячейки трендов: сигналы, затем флаги Гудхарта. */
export const aiTrendsHintLines = (trends: AiManagerTrends): string[] => {
    const lines = trends.signals.map(formatAiTrendSignal);
    for (const flag of trends.goodhart ?? []) {
        lines.push(`метрика растёт, результат — нет: ${formatAiGoodhartFlag(flag)}`);
    }
    if (lines.length === 0) {
        lines.push('Ряды спокойны: сдвигов и дрейфов за окно нет.');
    }
    lines.push(
        `Неделя расчёта ${trends.weekKey} · разборов в окне ${trends.calls} · ` +
            `сравнимых недель ${trends.weeks}`,
    );
    return lines;
};
