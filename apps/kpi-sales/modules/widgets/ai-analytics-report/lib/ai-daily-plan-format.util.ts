import { pluralRu } from '@/modules/entities/ai-analytics';
import {
    AI_DAILY_PLAN_FORECAST_FORMS,
    type AiCountForms,
} from './ai-daily-plan-activity.data';

/*
 * Числа «Плана дня» словами: счёт («<1», а не «0»), счёт с существительным,
 * прогноз «≈N продаж» и перечисление «a, b и c». Общие для модели
 * отображения (ai-daily-plan-view.util) и прогноза (ai-daily-plan-forecast.util).
 */

/** Счёт плана: 0,4 → «<1» (не «0»), 2,5 → «3», не число — «—». */
export const formatAiDailyCount = (value: number): string => {
    if (!Number.isFinite(value)) return '—';
    if (value <= 0) return '0';
    if (value < 1) return '<1';
    return Math.round(value).toLocaleString('ru-RU');
};

/** Счёт с существительным: «12 звонков», «<1 счёта». */
export const formatAiDailyCountWith = (
    value: number,
    forms: AiCountForms,
): string => {
    const count = formatAiDailyCount(value);
    const noun = count === '<1' ? forms[1] : pluralRu(value, forms);
    return `${count} ${noun}`;
};

/** Прогноз: «≈2 продажи», «<1 продажи», «0 продаж». */
export const formatAiDailyForecast = (value: number): string => {
    const text = formatAiDailyCountWith(value, AI_DAILY_PLAN_FORECAST_FORMS);
    return value >= 1 ? `≈${text}` : text;
};

/** «a», «a и b», «a, b и c». */
export const joinAiList = (parts: readonly string[]): string =>
    parts.length < 2
        ? (parts[0] ?? '')
        : `${parts.slice(0, -1).join(', ')} и ${parts[parts.length - 1]}`;
