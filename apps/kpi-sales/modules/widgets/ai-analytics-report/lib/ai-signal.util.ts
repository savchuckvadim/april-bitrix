import type { Tone } from '@workspace/april-ui';
import type {
    AiManagerRow,
    AiRiskCall,
} from '@/modules/entities/ai-analytics/model';
import { aiObjectionCategoryLabel } from '@/modules/entities/ai-analytics/lib/ai-overview.data';
import {
    AI_DISAGREE_REASON_MAX,
    clampAiDisagreeReason,
} from '@/modules/entities/ai-analytics/lib/ai-feedback.util';

/*
 * Чистая логика строки таблицы сигналов: рычаги (recommendations), стаж,
 * риск-звонки и причина «Не согласен» из списка + комментарий.
 * Импорты сущности точечные (model / lib).
 */

/** Рычаг из дневного снапшота прогноза (алиаса в model сущности нет). */
export type AiRecommendation = AiManagerRow['recommendations'][number];
export type AiRecommendationLever = AiRecommendation['lever'];
export type AiRecommendationEvidence = AiRecommendation['evidence'];

/** Рычаг: подпись, тон, единица стоимости (volume — минуты активности, остальные — часы). */
export const AI_LEVER: Record<
    AiRecommendationLever,
    { label: string; tone: Tone; costUnit: string }
> = {
    volume: { label: 'Объём', tone: 'info', costUnit: 'мин активности' },
    quality: { label: 'Качество', tone: 'primary', costUnit: 'ч коучинга' },
    checklist: { label: 'Чек-лист', tone: 'accent', costUnit: 'ч коучинга' },
    pipeline: { label: 'Сделки', tone: 'secondary', costUnit: 'ч' },
    objection: {
        label: 'Возражение',
        tone: 'warning',
        costUnit: 'ч коучинга',
    },
};

/** Уровень доказательности рекомендации. */
export const AI_EVIDENCE: Record<AiRecommendationEvidence, string> = {
    E0: 'факт с интервалом',
    E1: 'связь в данных',
    E2: 'пул порталов или квази-эксперимент',
    E3: 'пререгистрированный эксперимент',
};

/** Сколько рычагов показывать в строке (бэк отдаёт топ-3). */
export const AI_LEVERS_MAX = 3;

export const pickAiLevers = (
    recommendations: AiRecommendation[],
    max = AI_LEVERS_MAX,
): AiRecommendation[] => recommendations.slice(0, max);

/**
 * Адресат рычага: тип звонка · раздел/пункт · категория возражения;
 * ничего не задано — подпись самого рычага.
 */
export const aiLeverTitle = (
    recommendation: AiRecommendation,
    callTypeLabel: (code: string) => string = code => code,
): string => {
    const parts = [
        recommendation.callType ? callTypeLabel(recommendation.callType) : null,
        recommendation.section ?? null,
        recommendation.category
            ? aiObjectionCategoryLabel(recommendation.category)
            : null,
    ].filter((part): part is string => !!part);
    return parts.length
        ? parts.join(' · ')
        : AI_LEVER[recommendation.lever].label;
};

export const AI_LEVER_NO_EFFECT = 'без оценки эффекта';

/** Ожидаемый эффект: «+1,5 продаж»; без deltaSales (уровень E0) — честно без числа. */
export const formatAiLeverEffect = (
    recommendation: Pick<AiRecommendation, 'deltaSales'>,
): string =>
    recommendation.deltaSales === undefined
        ? AI_LEVER_NO_EFFECT
        : `+${recommendation.deltaSales.toLocaleString('ru-RU', {
              maximumFractionDigits: 1,
          })} продаж`;

/** Стоимость рычага в его единицах: «30 мин активности», «1,5 ч коучинга». */
export const formatAiLeverCost = (
    recommendation: Pick<AiRecommendation, 'cost' | 'lever'>,
): string =>
    `${recommendation.cost.toLocaleString('ru-RU', {
        maximumFractionDigits: 1,
    })} ${AI_LEVER[recommendation.lever].costUnit}`;

/** Строки подсказки рычага: адресат, эффект, стоимость, доказательность, опоры, правило. */
export const aiLeverHintLines = (
    recommendation: AiRecommendation,
    callTypeLabel?: (code: string) => string,
): string[] => [
    `Рычаг: ${AI_LEVER[recommendation.lever].label} — ${aiLeverTitle(
        recommendation,
        callTypeLabel,
    )}`,
    `Ожидаемый эффект: ${formatAiLeverEffect(recommendation)}`,
    `Стоимость: ${formatAiLeverCost(recommendation)}`,
    `Доказательность: ${recommendation.evidence} — ${
        AI_EVIDENCE[recommendation.evidence]
    }`,
    ...recommendation.basis,
    `Правило: ${recommendation.ruleCode}`,
];

/** YYYY-MM-DD → «01.03.2025»; иное — как есть. */
export const formatAiDateRu = (value: string): string => {
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}.${month}.${year}` : value;
};

export const AI_TENURE_UNKNOWN = 'стаж не задан';

/** Стаж: «с 01.03.2025 · 9 мес.»; без даты — «стаж 9 мес.»; ничего — «стаж не задан». */
export const formatAiSince = (
    since: string | undefined,
    tenureMonths: number | null,
): string => {
    const tenure = tenureMonths === null ? null : `${tenureMonths} мес.`;
    if (since) {
        const from = `с ${formatAiDateRu(since)}`;
        return tenure ? `${from} · ${tenure}` : from;
    }
    return tenure ? `стаж ${tenure}` : AI_TENURE_UNKNOWN;
};

/** Сколько риск-звонков показывать в строке. */
export const AI_RISK_CALLS_MAX = 3;

/** Свежие риск-звонки первыми, не больше max. */
export const pickAiRiskCalls = (
    calls: AiRiskCall[],
    max = AI_RISK_CALLS_MAX,
): AiRiskCall[] =>
    [...calls]
        .sort((a, b) => b.callStartedAt.localeCompare(a.callStartedAt))
        .slice(0, max);

/** Подпись «ещё N» для скрытых риск-звонков; всё показано — null. */
export const aiRiskCallsRestLabel = (
    total: number,
    max = AI_RISK_CALLS_MAX,
): string | null => (total > max ? `ещё ${total - max}` : null);

/* ---------- «Не согласен»: причина из списка + комментарий ---------- */

/** Причины несогласия со строкой обзора; в feedback уходит одной строкой reason. */
export const AI_DISAGREE_REASONS = [
    { code: 'score', label: 'Оценка не соответствует звонкам' },
    { code: 'signal', label: 'Сигнал не по делу' },
    { code: 'type', label: 'Тип звонка определён неверно' },
    { code: 'data', label: 'Разобраны не все звонки' },
    { code: 'other', label: 'Другое' },
] as const;

export type AiDisagreeReasonCode = (typeof AI_DISAGREE_REASONS)[number]['code'];

export const isAiDisagreeReasonCode = (
    value: string,
): value is AiDisagreeReasonCode =>
    AI_DISAGREE_REASONS.some(reason => reason.code === value);

export const aiDisagreeReasonLabel = (
    code: AiDisagreeReasonCode | null,
): string | null =>
    code
        ? (AI_DISAGREE_REASONS.find(reason => reason.code === code)?.label ??
          null)
        : null;

/** Разделитель «Подпись: комментарий». */
const REASON_SEPARATOR = ': ';

/** Сколько символов остаётся комментарию, чтобы «подпись: комментарий» уложились в лимит. */
export const aiDisagreeCommentMax = (
    code: AiDisagreeReasonCode | null,
): number => {
    const label = aiDisagreeReasonLabel(code);
    return label
        ? Math.max(
              0,
              AI_DISAGREE_REASON_MAX - label.length - REASON_SEPARATOR.length,
          )
        : AI_DISAGREE_REASON_MAX;
};

export const clampAiDisagreeComment = (
    code: AiDisagreeReasonCode | null,
    value: string,
): string => {
    const max = aiDisagreeCommentMax(code);
    return value.length > max ? value.slice(0, max) : value;
};

/** Причина для feedback: «Подпись: комментарий» | подпись | комментарий; пусто — undefined. */
export const composeAiDisagreeReason = (
    code: AiDisagreeReasonCode | null,
    comment: string,
): string | undefined => {
    const label = aiDisagreeReasonLabel(code);
    const text = clampAiDisagreeComment(code, comment).trim();
    const joined =
        label && text ? `${label}${REASON_SEPARATOR}${text}` : (label ?? text);
    const result = clampAiDisagreeReason(joined).trim();
    return result.length ? result : undefined;
};

/** Счётчик комментария «введено / доступно». */
export const formatAiDisagreeCommentCounter = (
    code: AiDisagreeReasonCode | null,
    value: string,
): string =>
    `${clampAiDisagreeComment(code, value).length} / ${aiDisagreeCommentMax(code)}`;
