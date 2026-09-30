/**
 * Алиасы DTO Фазы 4: «Как считаем», настройки гипотезы и пула, советы
 * (волна C, поток C2). Реэкспортируются из `model/index.ts`.
 */
import type {
    AiAboutEdgeEffectDto,
    AiAboutForecastAccuracyDto,
    AiAboutForecastAccuracyDtoReasonsItem,
    AiAboutForecastAccuracyDtoStatus,
    AiAboutIntervalDto,
    AiAboutPoolDto,
    AiAboutPoolDtoLabel,
    AiAboutPoolDtoSelfReason,
    AiAboutPoolDtoStatus,
    AiAboutQualityLinkDto,
    AiAboutQualityLinkDtoStatus,
    AiAboutRecommendationsEffectDto,
    AiAboutRecommendationsEffectDtoReasonsItem,
    AiAboutRecommendationsEffectDtoStatus,
    AiAboutShareDto,
    AiHypothesisDto,
    AiHypothesisPairDto,
    AiPoolConsentDto,
    AiRecommendationDto,
} from '@workspace/nest-kpi-report-sales-api';

/* ---------- «Как считаем»: общие формы ---------- */

/** Оценка с 90 %-интервалом; границы null — не определены. */
export type AiAboutInterval = AiAboutIntervalDto;
/** Доля 0..1 с 90 %-интервалом и знаменателем; value null — мало наблюдений. */
export type AiAboutShare = AiAboutShareDto;

/* ---------- «Связь качества с результатом» ---------- */

export type AiAboutQualityLink = AiAboutQualityLinkDto;
/** insufficient | estimated | published. */
export type AiAboutQualityLinkStatus = AiAboutQualityLinkDtoStatus;

/* ---------- «Точность прогноза на истории» ---------- */

export type AiAboutForecastAccuracy = AiAboutForecastAccuracyDto;
/** pass | fail | insufficient. */
export type AiAboutForecastAccuracyStatus = AiAboutForecastAccuracyDtoStatus;
/** Код причины непройденной проверки прогноза. */
export type AiAboutForecastAccuracyReason =
    AiAboutForecastAccuracyDtoReasonsItem;

/* ---------- «Общая статистика порталов» ---------- */

export type AiAboutPool = AiAboutPoolDto;
/** insufficient | estimated. */
export type AiAboutPoolStatus = AiAboutPoolDtoStatus;
/** Участвует ли портал: included | no-consent | consent-not-yet | short-history | null. */
export type AiAboutPoolSelfReason = AiAboutPoolDtoSelfReason;
/** Метка общей связи: estimated | hybrid | null. */
export type AiAboutPoolLabel = AiAboutPoolDtoLabel;

/* ---------- «Эффект советов» ---------- */

export type AiAboutRecommendationsEffect = AiAboutRecommendationsEffectDto;
/** pass | fail | insufficient. */
export type AiAboutRecommendationsEffectStatus =
    AiAboutRecommendationsEffectDtoStatus;
/** Код причины непройденной проверки советов. */
export type AiAboutRecommendationsEffectReason =
    AiAboutRecommendationsEffectDtoReasonsItem;
/** Шаг воронки до и после советов. */
export type AiAboutEdgeEffect = AiAboutEdgeEffectDto;

/* ---------- Настройки: гипотеза и пул ---------- */

/** Гипотеза портала «качество → число презентаций» (блок settings/save). */
export type AiHypothesis = AiHypothesisDto;
/** Пара гипотезы: при качестве s нужно n презентаций. */
export type AiHypothesisPair = AiHypothesisPairDto;
/** Согласие на обезличенную общую статистику порталов (блок settings/save). */
export type AiPoolConsent = AiPoolConsentDto;

/* ---------- Советы в строке обзора ---------- */

/** Совет строки обзора: ключ, отметка «Сделано», день первой выдачи. */
export type AiRecommendationItem = AiRecommendationDto;
