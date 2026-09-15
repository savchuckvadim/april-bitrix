import type { LiquidProgressTone } from '@workspace/april-ui';
import type { AiByTypeLongRowKind, AiMetric } from '../model';
import { AI_SCORE_TONE_THRESHOLDS } from './ai-overview.data';
import { formatAiRate } from './ai-metric.util';
import { formatAiCount } from './ai-finance.util';

/** Как читать value метрики: доля 0..1, оценка 1–10, проценты или счётчик. */
export type AiMetricKind = 'rate' | 'score' | 'pct' | 'count';

/** Оценка 1–10: 6.43 → «6,4»; null → «—». */
export const formatAiScore = (value: number | null | undefined): string =>
    value === null || value === undefined
        ? '—'
        : value.toLocaleString('ru-RU', { maximumFractionDigits: 1 });

/** Проценты, уже в %: 42.4 → «42 %»; null → «—». */
export const formatAiPct = (value: number | null | undefined): string =>
    value === null || value === undefined ? '—' : `${Math.round(value)} %`;

/** Значение метрики по виду. */
export const formatAiMetricValue = (
    value: number | null | undefined,
    kind: AiMetricKind,
): string => {
    switch (kind) {
        case 'score':
            return formatAiScore(value);
        case 'pct':
            return formatAiPct(value);
        case 'count':
            return formatAiCount(value);
        default:
            return formatAiRate(value);
    }
};

/** Вид метрики строки «длинной» раскладки по kind показателя. */
export const aiLongRowMetricKind = (
    kind: AiByTypeLongRowKind,
): AiMetricKind => {
    switch (kind) {
        case 'score':
        case 'section':
            return 'score';
        case 'kpi':
            return 'count';
        default:
            return 'pct';
    }
};

/** Доля полосы для оценки 1–10 (6.4 → 0.64); null → 0. */
export const aiScoreShare = (value: number | null | undefined): number =>
    value === null || value === undefined
        ? 0
        : Math.max(0, Math.min(value / 10, 1));

/** Тон полосы оценки: ≥ 7 — success, ≥ 5 — warning, ниже — destructive. */
export const aiScoreTone = (
    value: number | null | undefined,
): LiquidProgressTone => {
    if (value === null || value === undefined) return 'warning';
    if (value >= AI_SCORE_TONE_THRESHOLDS.success) return 'success';
    return value >= AI_SCORE_TONE_THRESHOLDS.warning
        ? 'warning'
        : 'destructive';
};

/** Есть ли у метрики значение для полосы (confidence ≠ none и value задан). */
export const hasAiMetricValue = (
    metric: AiMetric | null | undefined,
): boolean =>
    !!metric && metric.confidence.level !== 'none' && metric.value !== null;
