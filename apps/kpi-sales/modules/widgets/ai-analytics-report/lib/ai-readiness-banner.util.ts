import type { Tone } from '@workspace/april-ui';
import {
    AI_READINESS_HINTS,
    AI_READINESS_LABELS,
    AI_READINESS_TONES,
    formatAiReadinessReason,
    formatBetaCountdown,
    type AiReadiness,
    type AiReadinessBetaSource,
    type AiReadinessSigmaSource,
} from '@/modules/entities/ai-analytics';
import { formatAiAboutDate } from './ai-about.util';

/*
 * Баннер готовности витрины: модель отображения из ReadinessDto —
 * подписи вместо кодов, подсказки «что делать» к особым причинам,
 * связь «качество → исход», источник σ_llm, счётчик β и строка истории.
 */

/** Коды причин, к которым баннер даёт подсказку «что делать». */
export const AI_READINESS_REASON_CODE = {
    NO_PORTAL_MODEL: 'no-portal-model',
    ROSTER_NOT_CONFIRMED: 'roster-not-confirmed',
    HYPOTHESIS_NOT_SET: 'hypothesis-not-set',
    CALENDAR_NOT_IMPORTED: 'calendar-not-imported',
} as const;

/** Подсказка под подписью причины: что произойдёт / что сделать. */
export const AI_READINESS_REASON_HINTS: Record<string, string> = {
    [AI_READINESS_REASON_CODE.NO_PORTAL_MODEL]:
        'Ночной расчёт ещё не построил модель портала — нормы появятся после первого расчёта.',
    [AI_READINESS_REASON_CODE.ROSTER_NOT_CONFIRMED]:
        'Подтвердите состав и уровни менеджеров: пока состав не подтверждён, нормы и цели считаются по неподтверждённому ростеру.',
    [AI_READINESS_REASON_CODE.HYPOTHESIS_NOT_SET]:
        'Задайте гипотезу «при качестве S нужно N презентаций» (не меньше двух пар) в настройках портала — до оценки β по данным она заменяет связь качества и исхода.',
    [AI_READINESS_REASON_CODE.CALENDAR_NOT_IMPORTED]:
        'Импортируйте производственный календарь в настройках портала — без него рабочие дни и окна считаются по обычной неделе.',
};

/** Подпись связи «качество → исход» (ReadinessDto.betaSource). */
export const AI_BETA_SOURCE_LABELS: Record<AiReadinessBetaSource, string> = {
    none: 'связь «качество → исход» не задана',
    hypothesis: 'связь «качество → исход» — по гипотезе портала',
    data: 'связь «качество → исход» оценена по данным портала',
};

/** Подпись источника σ_llm (ReadinessDto.sigmaLlmSource). */
export const AI_SIGMA_SOURCE_LABELS: Record<AiReadinessSigmaSource, string> = {
    measured: 'шум оценщика (σ_llm) измерен повтором разборов',
    configured: 'шум оценщика (σ_llm) взят из реестра — повтор разборов ещё не делали',
};

export interface AiReadinessReasonItem {
    code: string;
    /** Русская подпись кода (formatAiReadinessReason). */
    label: string;
    /** Подсказка «что делать»; null — код без особой подсказки. */
    hint: string | null;
    /** Причина закрывается кнопкой «Подтвердить состав». */
    confirmRoster: boolean;
}

export interface AiReadinessBannerModel {
    title: string;
    hint: string;
    tone: Tone;
    reasons: AiReadinessReasonItem[];
    betaSource: string;
    /** Строка источника σ_llm; null — бэк поле не прислал (старая сборка). */
    sigmaSource: string | null;
    /** Строка счётчика «до оценки β»; null — счётчика нет. */
    countdown: string | null;
    history: string;
}

/** Причины режима в порядке бэка (дубли схлопнуты) с подписями и подсказками. */
export const buildAiReadinessReasons = (
    reasons: readonly string[] | undefined,
): AiReadinessReasonItem[] =>
    [...new Set(reasons ?? [])].map(code => ({
        code,
        label: formatAiReadinessReason(code),
        hint: AI_READINESS_REASON_HINTS[code] ?? null,
        confirmRoster: code === AI_READINESS_REASON_CODE.ROSTER_NOT_CONFIRMED,
    }));

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

/** Модель баннера из ReadinessDto — вся логика подписей вне вёрстки. */
export const buildAiReadinessBanner = (
    readiness: AiReadiness,
): AiReadinessBannerModel => ({
    title: AI_READINESS_LABELS[readiness.mode],
    hint: AI_READINESS_HINTS[readiness.mode],
    tone: AI_READINESS_TONES[readiness.mode],
    reasons: buildAiReadinessReasons(readiness.reasons),
    betaSource: AI_BETA_SOURCE_LABELS[readiness.betaSource],
    sigmaSource: readiness.sigmaLlmSource
        ? AI_SIGMA_SOURCE_LABELS[readiness.sigmaLlmSource]
        : null,
    countdown: formatBetaCountdown(readiness.betaCountdown),
    history: formatAiReadinessHistory(readiness),
});
