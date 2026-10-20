import type { Tone } from '@workspace/april-ui';
import type {
    AiGoodhartFlag,
    AiManagerTrends,
    AiTrendSignal,
    AiTrendSignalKind,
} from '../model';
import { aiIsoWeekRange, formatAiMonthLabelRange } from './ai-period-label.util';

/*
 * Тренды строки менеджера и флаги «показатель растёт, результат нет»:
 * подписи показателей и видов сигнала, направление словами (без стрелок),
 * формат величин. Слова нейтральные: тренд — факт о ряде, не оценка
 * человека. Недели и месяцы — датами, не ключами бэка.
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

/** Направление сигнала словами: «растёт» / «снижается» (стрелок на экране нет). */
export const AI_TREND_DIRECTION_WORD = {
    up: 'растёт',
    down: 'снижается',
} as const;

export const aiTrendDirectionWord = (
    direction: AiTrendSignal['direction'],
): string => AI_TREND_DIRECTION_WORD[direction];

/** Бэйдж флага Гудхарта и его подсказка (досье, ячейка «Тренды»). */
export const AI_TREND_GOODHART = {
    label: 'показатель растёт, результат нет',
    hint: {
        title: 'Показатель растёт, результат нет',
        lines: [
            'Менеджер делает больше того, что от него требуют, а продажи от этого не растут.',
            'Проверьте, не гонится ли он за цифрой: посмотрите, какие звонки и презентации стоят за ростом.',
        ],
    },
} as const;

/** Подсказка к колонке «Тренды» таблицы сигналов. */
export const AI_TRENDS_COLUMN_HINT = {
    title: 'Тренды',
    lines: [
        'Как меняются оценки и объём звонков за последние недели: что снижается, что растёт, и не растёт ли показатель без результата.',
        'Колонка появится, когда накопится 4 сравнимые недели. Наведите на бэйдж — увидите каждый сигнал.',
    ],
} as const;

/** Величина сигнала в единицах показателя: доли рёбер — в п.п., остальное — как есть. */
export const formatAiTrendMagnitude = (signal: AiTrendSignal): string => {
    const sign = signal.magnitude > 0 ? '+' : '−';
    const abs = Math.abs(signal.magnitude);
    if (signal.metric.startsWith('edge_')) {
        return `${sign}${Math.round(abs * 100)} п.п.`;
    }
    return `${sign}${abs.toFixed(1).replace('.', ',')}`;
};

/** Строка сигнала: «оценка снижается: сдвиг −0,8 с недели 27.07–02.08»; битая неделя — без хвоста. */
export const formatAiTrendSignal = (signal: AiTrendSignal): string => {
    const week = aiIsoWeekRange(signal.sinceWeek);
    return (
        `${aiTrendMetricLabel(signal.metric)} ${aiTrendDirectionWord(signal.direction)}: ` +
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

/** Ряды спокойны: ни сигналов, ни флагов. */
export const AI_TRENDS_CALM_LABEL = 'ровно';

/**
 * Короткая подпись ячейки «Тренды» словами: «снижается: 2 · растёт: 1 ·
 * показатель растёт, результат нет»; без сигналов и флагов — «ровно».
 */
export const aiTrendsSummaryLabel = (trends: AiManagerTrends): string => {
    const down = trends.signals.filter(s => s.direction === 'down').length;
    const up = trends.signals.length - down;
    const parts: string[] = [];
    if (down) parts.push(`${AI_TREND_DIRECTION_WORD.down}: ${down}`);
    if (up) parts.push(`${AI_TREND_DIRECTION_WORD.up}: ${up}`);
    if (trends.goodhart?.length) parts.push(AI_TREND_GOODHART.label);
    return parts.length ? parts.join(' · ') : AI_TRENDS_CALM_LABEL;
};

/** Проценты изменения флага: «+50 %», «−36 %». */
export const formatAiGoodhartChange = (change: number): string =>
    `${change > 0 ? '+' : '−'}${Math.round(Math.abs(change) * 100)} %`;

/** Строка флага: «число разборов +50 %, оценка −36 % за 3 мес. (июнь – август 2026)». */
export const formatAiGoodhartFlag = (flag: AiGoodhartFlag): string =>
    `${aiTrendMetricLabel(flag.pressure)} ${formatAiGoodhartChange(flag.pressureChange)}, ` +
    `${aiTrendMetricLabel(flag.counter)} ${formatAiGoodhartChange(flag.counterChange)} ` +
    `за ${flag.points} мес. (${formatAiMonthLabelRange(flag.fromKey, flag.toKey)})`;

/** Строки подсказки ячейки трендов: сигналы, затем флаги «показатель растёт, результат нет». */
export const aiTrendsHintLines = (trends: AiManagerTrends): string[] => {
    const lines = trends.signals.map(formatAiTrendSignal);
    for (const flag of trends.goodhart ?? []) {
        lines.push(`${AI_TREND_GOODHART.label}: ${formatAiGoodhartFlag(flag)}`);
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
