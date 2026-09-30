/*
 * Причины готовности Фазы 4 — ступени «Прогноз» и «Советы» (бэк:
 * libs/sales-ai-analytics model/readiness-phase4.types.ts,
 * AI_READINESS_PHASE4_REASON_CODES). Коды — as const, подписи — по-русски
 * без кодов и формул: что происходит и чего ждём. Файл ни от чего в lib
 * не зависит (подписи склеиваются в ai-readiness.data.ts) — без циклов.
 */

/** Коды причин без числа гейта. */
export const AI_READINESS_PHASE4_REASON = {
    /** Проверке точности прогноза не хватает месяцев или дней. */
    FORECAST_BACKTEST_INSUFFICIENT: 'forecast-backtest-insufficient',
    /** Факт попадает в вилку реже цели. */
    FORECAST_COVERAGE: 'forecast-coverage-outside',
    /** Прогноз ошибается не реже простых правил. */
    FORECAST_MASE: 'forecast-mase-not-below',
    /** Проверка пройдена, но показ прогноза не включён. */
    FORECAST_DISABLED: 'forecast-stage-disabled',
    /** Журнала прогноза и проверки точности ещё нет. */
    FORECAST_LOG_MISSING: 'forecast-log-missing',
    /**
     * Только ручка прогноза: проверка пройдена и показ включён, но
     * готовность портала ниже «прогноза» — вилку не показываем.
     */
    FORECAST_READINESS_BELOW: 'forecast-readiness-below',
    /** Советы ждут, пока ступень прогноза пройдёт проверку. */
    RECOMMENDATIONS_NEEDS_FORECAST: 'recommendations-needs-forecast',
    /** Доля выполненных советов ниже порога. */
    RECOMMENDATIONS_DONE_SHARE: 'recommendations-done-share-below',
    /** Доля несогласий с советами выше порога. */
    RECOMMENDATIONS_DISAGREE: 'recommendations-disagree-above',
    /** Ни один шаг воронки после советов не улучшился. */
    RECOMMENDATIONS_NO_POSITIVE_EDGE: 'recommendations-no-positive-edge',
    /** Контроль подгонки под показатель поднял флаги. */
    RECOMMENDATIONS_GOODHART: 'recommendations-goodhart-flags',
    /** Проверка советов пройдена, но показ не включён. */
    RECOMMENDATIONS_DISABLED: 'recommendations-stage-disabled',
    /** Оценки эффекта советов ещё нет. */
    RECOMMENDATIONS_EFFECT_MISSING: 'recommendations-effect-missing',
} as const;
export type AiReadinessPhase4Reason =
    (typeof AI_READINESS_PHASE4_REASON)[keyof typeof AI_READINESS_PHASE4_REASON];

/** Префиксы кодов с числом гейта в хвосте: `forecast-shadow-months-below-9`. */
export const AI_READINESS_PHASE4_GATED_REASON = {
    /** Закрытых месяцев теневого прогноза меньше гейта. */
    FORECAST_SHADOW_MONTHS: 'forecast-shadow-months-below',
    /** Советов с завершённой проверкой меньше гейта. */
    RECOMMENDATIONS_ISSUED: 'recommendations-issued-below',
    /** Выданных советов меньше минимума выборки — доли ещё не считаются. */
    RECOMMENDATIONS_SHARES_ISSUED: 'recommendations-shares-issued-below',
} as const;
export type AiReadinessPhase4GatedReason =
    (typeof AI_READINESS_PHASE4_GATED_REASON)[keyof typeof AI_READINESS_PHASE4_GATED_REASON];

const R = AI_READINESS_PHASE4_REASON;
const G = AI_READINESS_PHASE4_GATED_REASON;

/** Подписи причин без гейта. */
export const AI_READINESS_PHASE4_REASON_LABELS: Record<
    AiReadinessPhase4Reason,
    string
> = {
    [R.FORECAST_BACKTEST_INSUFFICIENT]:
        'Для проверки точности прогноза на истории пока мало данных',
    [R.FORECAST_COVERAGE]: 'Факт попадает в вилку прогноза реже, чем нужно',
    [R.FORECAST_MASE]: 'Прогноз пока не точнее простых правил',
    [R.FORECAST_DISABLED]:
        'Прогноз прошёл проверку на истории, но показ не включён — попросите разработчика',
    [R.FORECAST_LOG_MISSING]: 'Прогноз отдела ещё не начал копиться',
    [R.FORECAST_READINESS_BELOW]:
        'Прогноз проверен, но скрыт, пока аналитике не хватает базовых данных',
    [R.RECOMMENDATIONS_NEEDS_FORECAST]:
        'Советы ждут, пока проверку на истории пройдёт прогноз',
    [R.RECOMMENDATIONS_DONE_SHARE]:
        'Советы выполняют реже, чем нужно для оценки их пользы',
    [R.RECOMMENDATIONS_DISAGREE]: 'С советами слишком часто не согласны',
    [R.RECOMMENDATIONS_NO_POSITIVE_EDGE]:
        'После советов шаги воронки пока не улучшились',
    [R.RECOMMENDATIONS_GOODHART]:
        'Есть признаки подгонки под показатели — пользу советов пока не засчитываем',
    [R.RECOMMENDATIONS_DISABLED]:
        'Советы проверены на ваших данных, но показ не включён — попросите разработчика',
    [R.RECOMMENDATIONS_EFFECT_MISSING]: 'Пользу советов ещё не оценивали',
};

/** Подписи причин с гейтом (число из хвоста кода). */
export const AI_READINESS_PHASE4_GATED_REASON_LABELS: Record<
    AiReadinessPhase4GatedReason,
    (gate: number) => string
> = {
    [G.FORECAST_SHADOW_MONTHS]: gate =>
        `Прогноз копится в тени: для проверки нужно не меньше ${gate} мес. сверки с фактом`,
    [G.RECOMMENDATIONS_ISSUED]: gate =>
        `Советов с завершённой проверкой пока меньше ${gate}`,
    [G.RECOMMENDATIONS_SHARES_ISSUED]: gate =>
        `Выдано советов пока меньше ${gate} — долю выполненных ещё не считаем`,
};
