import type {
    AiDailyPlan,
    AiDailyPlanReason,
} from '@/modules/entities/ai-analytics';
import { AI_DAILY_PLAN_FORECAST_UNKNOWN } from './ai-daily-plan-activity.data';
import { formatAiDailyForecast } from './ai-daily-plan-format.util';
import { aiDailyPlanCallCap } from './ai-daily-plan.util';

/*
 * Прогноз месяца руководителю (ropOnly.gExpected / gCeiling). В деградации
 * (нет модели портала или дневного прогноза) бэк отдаёт оба числа равными
 * «уже закрыто + сделки в работе»: это не прогноз, поэтому вместо чисел —
 * честная фраза «прогноз не оценён». То же, когда числа совпали, а обычного
 * максимума звонков (cap) нет: потолок без cap бэк приравнивает к ожиданию.
 */

export interface AiDailyPlanForecastView {
    /** «≈2 продажи» — ожидание месяца по обычному дневному темпу (G′). */
    expected: string;
    /** «≈4 продажи» — месяц на обычном максимуме звонков портала (G′ потолка). */
    best: string;
}

export interface AiDailyPlanForecastState {
    /** Числа прогноза; null — блока руководителя нет или прогноз не оценён. */
    forecast: AiDailyPlanForecastView | null;
    /** Почему прогноз не оценён; null — числа есть или блока руководителя нет. */
    note: string | null;
}

/** Деградации, при которых прогноза месяца нет вовсе. */
const UNKNOWN_BY_REASON: Partial<
    Record<NonNullable<AiDailyPlanReason>, string>
> = {
    'portal-model-missing': AI_DAILY_PLAN_FORECAST_UNKNOWN.modelMissing,
    'forecast-missing': AI_DAILY_PLAN_FORECAST_UNKNOWN.forecastMissing,
};

type ForecastSource = Pick<AiDailyPlan, 'ropOnly' | 'reason' | 'items'>;

/** Почему прогноз не оценён; null — оценён (или блока руководителя нет). */
export const aiDailyPlanForecastNote = (
    plan: ForecastSource,
): string | null => {
    const { ropOnly } = plan;
    if (!ropOnly) return null;
    const byReason = plan.reason ? UNKNOWN_BY_REASON[plan.reason] : undefined;
    if (byReason) return byReason;
    return ropOnly.gExpected === ropOnly.gCeiling &&
        aiDailyPlanCallCap(plan.items) === null
        ? AI_DAILY_PLAN_FORECAST_UNKNOWN.noCap
        : null;
};

/** Прогноз месяца руководителю: числа, фраза «не оценён» или ничего (менеджер). */
export const buildAiDailyPlanForecast = (
    plan: ForecastSource,
): AiDailyPlanForecastState => {
    const note = aiDailyPlanForecastNote(plan);
    if (!plan.ropOnly || note) return { forecast: null, note };
    return {
        forecast: {
            expected: formatAiDailyForecast(plan.ropOnly.gExpected),
            best: formatAiDailyForecast(plan.ropOnly.gCeiling),
        },
        note: null,
    };
};
