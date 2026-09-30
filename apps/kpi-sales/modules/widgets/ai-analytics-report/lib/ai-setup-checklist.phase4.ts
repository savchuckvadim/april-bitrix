import {
    AI_READINESS_PHASE4_GATED_REASON,
    AI_READINESS_PHASE4_REASON,
    formatAiReadinessReason,
    pluralRu,
    type AiReadinessPhase4Reason,
} from '@/modules/entities/ai-analytics';
import { aiReadinessGate } from './ai-readiness-banner.util';
import {
    aiForecastAccuracyText,
    aiForecastReadyDate,
} from './ai-forecast.util';
import {
    AI_FORECAST_MONTH_FORMS,
    AI_FORECAST_MONTH_OF_FORMS,
} from './ai-forecast.texts';
import { AI_CHECKLIST_PHASE4_TEXT } from './ai-setup-checklist.phase4.texts';
import { aiRoughEta } from './ai-setup-checklist.eta';
import {
    aiTextAction,
    aiTodoItem,
    type AiChecklistContext,
} from './ai-setup-checklist.context';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    type AiChecklistItem,
} from './ai-setup-checklist.types';

/*
 * Пункты Фазы 4 — ступени «Прогноз» и «Советы» поверх норм. Источник —
 * причины готовности (бэк дописывает их, только когда база дошла до норм),
 * числа — из ответа прогноза отдела, если он есть (руководителю): сколько
 * месяцев уже в тени и как прошла последняя проверка. Ожидание — WAIT,
 * «проверено, но показ не включён» — CONFIGURE по желанию (включает
 * разработчик).
 */

const T = AI_CHECKLIST_PHASE4_TEXT;
const R = AI_READINESS_PHASE4_REASON;
const WAIT = AI_CHECKLIST_GROUP.WAIT;
const CONFIGURE = AI_CHECKLIST_GROUP.CONFIGURE;

/** Причины ожидания советов (без «показ не включён» — это пункт настройки). */
const RECOMMENDATION_WAIT_CODES: readonly AiReadinessPhase4Reason[] = [
    R.RECOMMENDATIONS_NEEDS_FORECAST,
    R.RECOMMENDATIONS_DONE_SHARE,
    R.RECOMMENDATIONS_DISAGREE,
    R.RECOMMENDATIONS_NO_POSITIVE_EDGE,
    R.RECOMMENDATIONS_GOODHART,
    R.RECOMMENDATIONS_EFFECT_MISSING,
];

const GATED = /^(.+)-(\d+)$/;

/** Гейты ожидания советов: завершённые проверки и выданные для долей. */
const RECOMMENDATION_WAIT_GATES: readonly string[] = [
    AI_READINESS_PHASE4_GATED_REASON.RECOMMENDATIONS_ISSUED,
    AI_READINESS_PHASE4_GATED_REASON.RECOMMENDATIONS_SHARES_ISSUED,
];

/** Код ожидания советов: плоский или с гейтом «советов меньше N». */
const isRecommendationWait = (code: string): boolean =>
    (RECOMMENDATION_WAIT_CODES as readonly string[]).includes(code) ||
    RECOMMENDATION_WAIT_GATES.includes(GATED.exec(code)?.[1] ?? '');

/** Подписи причин одной строкой: «Первая; вторая; третья». */
const joinReasons = (codes: readonly string[]): string =>
    codes
        .map(formatAiReadinessReason)
        .map((label, index) =>
            index === 0
                ? label
                : label.charAt(0).toLowerCase() + label.slice(1),
        )
        .join('; ');

/** Прогноз ещё не начал копиться: журнала нет и в ответе пусто. */
const forecastNotStarted = (ctx: AiChecklistContext): boolean => {
    if (!ctx.reasons.has(R.FORECAST_LOG_MISSING)) return false;
    return (ctx.forecast?.shadow.monthsLogged ?? 0) === 0;
};

/**
 * Прогноз копится в тени: «N из M месяцев» (N — из ответа прогноза) и
 * примерная дата, когда наберётся история. Без ответа прогноза — только
 * сколько нужно, без прогресса и срока (честно: сколько есть, не знаем).
 */
export const aiForecastShadowItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const gate = aiReadinessGate(
        ctx.reasons,
        AI_READINESS_PHASE4_GATED_REASON.FORECAST_SHADOW_MONTHS,
    );
    const shadow = ctx.forecast?.shadow ?? null;
    const needed = gate ?? shadow?.minMonths ?? null;
    const code = AI_CHECKLIST_ITEM.FORECAST_SHADOW;
    if (forecastNotStarted(ctx)) {
        return aiTodoItem(code, WAIT, {
            title: T.forecastShadow.startTitle,
            detail: T.forecastShadow.startDetail,
            unlocks: T.forecastShadow.unlocks,
            progress: needed === null ? null : { value: 0, target: needed },
            eta: aiRoughEta(
                needed === null
                    ? null
                    : aiForecastReadyDate(ctx.today, 0, needed),
            ),
        });
    }
    // Журнал уже копится, а проверки ещё не было (причина «журнала нет» без
    // гейта) — прогресс из ответа прогноза, а не пропавший пункт.
    const logMissing = ctx.reasons.has(R.FORECAST_LOG_MISSING);
    if ((gate === null && !logMissing) || needed === null) return null;
    const detail = T.forecastShadow.detail(
        needed,
        pluralRu(needed, AI_FORECAST_MONTH_FORMS),
    );
    if (!shadow) {
        return aiTodoItem(code, WAIT, {
            title: T.forecastShadow.titleNoCount(
                needed,
                pluralRu(needed, AI_FORECAST_MONTH_FORMS),
            ),
            detail,
            unlocks: T.forecastShadow.unlocks,
        });
    }
    const logged = Math.max(0, Math.min(shadow.monthsLogged, needed));
    return aiTodoItem(code, WAIT, {
        title: T.forecastShadow.title(
            logged,
            needed,
            pluralRu(needed, AI_FORECAST_MONTH_OF_FORMS),
        ),
        detail,
        unlocks: T.forecastShadow.unlocks,
        progress: { value: logged, target: needed },
        eta: aiRoughEta(aiForecastReadyDate(ctx.today, logged, needed)),
    });
};

/**
 * Проверка точности на истории не пройдена: факт реже попадает в вилку
 * или прогноз не точнее простых правил. «Мало данных» — отдельным пунктом
 * лишь когда теневых месяцев уже хватает (иначе это тот же пункт «в тени»).
 */
export const aiForecastAccuracyItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const failed =
        ctx.reasons.has(R.FORECAST_COVERAGE) || ctx.reasons.has(R.FORECAST_MASE);
    const shadowGate = aiReadinessGate(
        ctx.reasons,
        AI_READINESS_PHASE4_GATED_REASON.FORECAST_SHADOW_MONTHS,
    );
    const insufficient =
        ctx.reasons.has(R.FORECAST_BACKTEST_INSUFFICIENT) && shadowGate === null;
    if (!failed && !insufficient) return null;
    const codes = [
        R.FORECAST_BACKTEST_INSUFFICIENT,
        R.FORECAST_COVERAGE,
        R.FORECAST_MASE,
    ].filter(code => ctx.reasons.has(code));
    return aiTodoItem(AI_CHECKLIST_ITEM.FORECAST_ACCURACY, WAIT, {
        title: failed
            ? T.forecastAccuracy.title
            : T.forecastAccuracy.titleInsufficient,
        detail: ctx.forecast
            ? aiForecastAccuracyText(ctx.forecast)
            : `${joinReasons(codes)}.`,
        unlocks: T.forecastAccuracy.unlocks,
    });
};

/** Прогноз прошёл проверку, показ не включён — включает разработчик. */
export const aiForecastStageItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null =>
    ctx.reasons.has(R.FORECAST_DISABLED)
        ? aiTodoItem(AI_CHECKLIST_ITEM.FORECAST_STAGE, CONFIGURE, {
              optional: true,
              title: T.forecastStage.title,
              detail: T.forecastStage.detail,
              unlocks: T.forecastStage.unlocks,
              actions: [aiTextAction(T.forecastStage.fix)],
          })
        : null;

/**
 * Советы проверяются: причины словами одной строкой. Мало отметок
 * «Сделано» и частые несогласия ожиданием не исправить — тогда пункт в
 * «Настроить» с действием, иначе — «Подождать».
 */
export const aiRecommendationsItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const codes = [...ctx.reasons].filter(isRecommendationWait);
    if (!codes.length) return null;
    const lowDone = ctx.reasons.has(R.RECOMMENDATIONS_DONE_SHARE);
    const disagree = ctx.reasons.has(R.RECOMMENDATIONS_DISAGREE);
    const actions = [
        ...(lowDone ? [aiTextAction(T.recommendations.markDone)] : []),
        ...(disagree ? [aiTextAction(T.recommendations.reviewDisagree)] : []),
    ];
    const title = lowDone
        ? T.recommendations.titleMarks
        : disagree
          ? T.recommendations.titleDisagree
          : T.recommendations.title;
    return aiTodoItem(
        AI_CHECKLIST_ITEM.RECOMMENDATIONS,
        actions.length ? CONFIGURE : WAIT,
        {
            title,
            detail: T.recommendations.detail(joinReasons(codes)),
            unlocks: T.recommendations.unlocks,
            ...(actions.length ? { actions } : {}),
        },
    );
};

/** Советы проверены, показ не включён — включает разработчик. */
export const aiRecommendationsStageItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null =>
    ctx.reasons.has(R.RECOMMENDATIONS_DISABLED)
        ? aiTodoItem(AI_CHECKLIST_ITEM.RECOMMENDATIONS_STAGE, CONFIGURE, {
              optional: true,
              title: T.recommendationsStage.title,
              detail: T.recommendationsStage.detail,
              unlocks: T.recommendationsStage.unlocks,
              actions: [aiTextAction(T.recommendationsStage.fix)],
          })
        : null;
