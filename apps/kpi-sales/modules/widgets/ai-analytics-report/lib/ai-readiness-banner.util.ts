import {
    AI_READINESS_HINTS,
    type AiReadiness,
    type AiReadinessBetaSource,
    type AiReadinessMode,
    type AiReadinessSigmaSource,
} from '@/modules/entities/ai-analytics';
import { formatAiAboutDate } from './ai-about.util';

/*
 * Баннер готовности витрины: шапка из ReadinessDto (режим, одна строка «что
 * это значит», строка истории, источник разброса оценок) и коды причин режима. Сами
 * причины показывает чек-лист (ai-setup-checklist.*) — здесь их не дублируем.
 */

/** Коды причин без гейта (бэк: AI_READINESS_REASON_CODES / _QUALITY_REASON_CODES). */
export const AI_READINESS_REASON_CODE = {
    NO_ANALYSIS: 'no-analysis-in-pipeline-window',
    NO_PORTAL_MODEL: 'no-portal-model',
    ROSTER_NOT_CONFIRMED: 'roster-not-confirmed',
    HYPOTHESIS_NOT_SET: 'hypothesis-not-set',
    CALENDAR_NOT_IMPORTED: 'calendar-not-imported',
    DATA_QUALITY_TIMESTAMP_LEAK: 'data-quality-timestamp-leak',
} as const;

/** Префиксы кодов с гейтом в хвосте: `history-months-below-3` и т. п. */
export const AI_READINESS_GATED_REASON = {
    HISTORY_MONTHS: 'history-months-below',
    PRESENTATIONS: 'presentations-below',
    NORMS_PRESENTATIONS: 'norms-presentations-below',
} as const;
export type AiReadinessGatedReason =
    (typeof AI_READINESS_GATED_REASON)[keyof typeof AI_READINESS_GATED_REASON];

const GATED_REASON = /^(.+)-(\d+)$/;
const GATED_PREFIXES: readonly string[] = Object.values(
    AI_READINESS_GATED_REASON,
);
const PLAIN_CODES: readonly string[] = Object.values(AI_READINESS_REASON_CODE);

/** Короткое имя режима для заголовка «Готовность витрины: …». */
export const AI_READINESS_MODE_SHORT: Record<AiReadinessMode, string> = {
    'kpi-only': 'только KPI',
    calibration: 'калибровка',
    descriptive: 'описательный режим',
    norms: 'нормы',
    hypothesis: 'проверка гипотез',
    forecast: 'прогноз',
    recommendations: 'рекомендации',
};

/** Подпись связи «качество → исход» (ReadinessDto.betaSource). */
export const AI_BETA_SOURCE_LABELS: Record<AiReadinessBetaSource, string> = {
    none: 'связь «качество → исход» не задана',
    hypothesis: 'связь «качество → исход» — по гипотезе портала',
    data: 'связь «качество → исход» оценена по данным портала',
};

/** Подпись источника разброса оценок AI (ReadinessDto.sigmaLlmSource). */
export const AI_SIGMA_SOURCE_LABELS: Record<AiReadinessSigmaSource, string> = {
    measured: 'Разброс оценок AI измерен повторными разборами',
    configured:
        'Разброс оценок AI взят по умолчанию — повторных разборов ещё не было',
};

/**
 * Гейт причины с числом в хвосте: `history-months-below-3` → 3. Префикс
 * сравнивается целиком — `presentations-below` не совпадёт с
 * `norms-presentations-below-100`. Причины нет — null.
 */
export const aiReadinessGate = (
    reasons: Iterable<string>,
    prefix: AiReadinessGatedReason,
): number | null => {
    for (const code of reasons) {
        const match = GATED_REASON.exec(code);
        if (match && match[1] === prefix) return Number(match[2]);
    }
    return null;
};

/** Код известен чек-листу (свой пункт); неизвестный — общий пункт «причина». */
export const isAiKnownReadinessReason = (code: string): boolean => {
    if (PLAIN_CODES.includes(code)) return true;
    const prefix = GATED_REASON.exec(code)?.[1];
    return prefix !== undefined && GATED_PREFIXES.includes(prefix);
};

/** Есть ли среди причин режима данный код. */
export const hasAiReadinessReason = (
    readiness: Pick<AiReadiness, 'reasons'>,
    code: string,
): boolean => readiness.reasons.includes(code);

/** Строка объёма истории: месяцы, презентации, продажи, сопоставимость версий. */
export const formatAiReadinessHistory = (
    readiness: Pick<
        AiReadiness,
        'historyMonths' | 'presentations' | 'sales' | 'comparableFrom'
    >,
): string => {
    const parts = [
        `История разборов: ${readiness.historyMonths} мес.`,
        `презентаций: ${readiness.presentations}`,
        `продаж: ${readiness.sales}`,
    ];
    if (readiness.comparableFrom) {
        parts.push(
            `разборы сопоставимы с ${formatAiAboutDate(readiness.comparableFrom)}`,
        );
    }
    return parts.join(' · ');
};

export interface AiReadinessBannerModel {
    /** «Готовность витрины: калибровка». */
    title: string;
    /** Одна строка «что значит режим». */
    hint: string;
    /** Строка источника разброса оценок; null — бэк поле не прислал. */
    sigmaSource: string | null;
    history: string;
}

/** Шапка баннера из ReadinessDto — вся логика подписей вне вёрстки. */
export const buildAiReadinessBanner = (
    readiness: AiReadiness,
): AiReadinessBannerModel => ({
    title: `Готовность витрины: ${AI_READINESS_MODE_SHORT[readiness.mode]}`,
    hint: AI_READINESS_HINTS[readiness.mode],
    sigmaSource: readiness.sigmaLlmSource
        ? AI_SIGMA_SOURCE_LABELS[readiness.sigmaLlmSource]
        : null,
    history: formatAiReadinessHistory(readiness),
});
