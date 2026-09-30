import {
    AI_READINESS_PHASE4_REASON,
    formatAiFullDate,
    formatAiMoneyCompact,
    formatAiMonthLabel,
    pluralRu,
    type AiForecast,
    type AiForecastBand,
} from '@/modules/entities/ai-analytics';
import type { AiTheoryTopic } from './ai-theory-link';
import {
    formatAiDailyCount,
    formatAiDailyCountWith,
    formatAiDailyForecast,
} from './ai-daily-plan-format.util';
import { AI_DAILY_PLAN_FORECAST_FORMS } from './ai-daily-plan-activity.data';
import {
    AI_FORECAST_CASE_FORMS,
    AI_FORECAST_MONTH_OF_FORMS,
    AI_FORECAST_TEXT,
} from './ai-forecast.texts';
import { aiForecastReadyDate } from './ai-forecast-date.util';

export { aiForecastReadyDate };

/*
 * Карточка «Прогноз отдела» (Фаза 4): «в тени» — прогресс журнала, срок,
 * точность словами и «что делать»; «включён» — вилка, деньги, сделано и
 * простые прогнозы. null ≠ 0: нет значения — честное «нет», а не ноль.
 */

const T = AI_FORECAST_TEXT;
const R = AI_READINESS_PHASE4_REASON;
const TENTHS = 10;
const HUNDREDTHS = 100;

export interface AiForecastProgress {
    value: number;
    target: number;
}

export interface AiForecastShadowView {
    kind: 'shadow';
    /** «Прогноз копится в тени: 4 из 9 месяцев». */
    progressTitle: string;
    progress: AiForecastProgress;
    /** Доля для полосы прогресса (0–1). */
    share: number;
    /** «История для проверки наберётся к 01.02.2027»; null — срок не оценить. */
    eta: string | null;
    /** Проверка пройдена, показ не включён. */
    stageReady: boolean;
    explain: string;
    /** Последняя проверка точности словами. */
    accuracy: string;
    todo: string;
    theory: AiTheoryTopic;
}

export interface AiForecastMoneyView {
    middle: string;
    range: string;
    /** Пометка «чек не ваш / уточнён»; null — свой чек или источник неизвестен. */
    note: string | null;
}

export interface AiForecastPublishedView {
    kind: 'published';
    /** «сентябрь 2026 · по данным на 28.09.2026». */
    period: string;
    middle: string;
    low: string;
    high: string;
    rangeCaption: string;
    /** Деньги; null — чека нет. */
    money: AiForecastMoneyView | null;
    /** «21 продажа»; null — журнала нет. */
    done: string | null;
    /** Простые прогнозы для подсказки. */
    compareLines: string[];
    accuracy: string;
    todo: string;
    theory: AiTheoryTopic;
}

export interface AiForecastEmptyView {
    kind: 'empty';
    text: string;
}

export type AiForecastView =
    | AiForecastShadowView
    | AiForecastPublishedView
    | AiForecastEmptyView;

/** «Примерно 8 из 10 месяцев…»: уровень вилки из ответа; нет уровня — «в большинстве». */
export const formatAiForecastLevel = (level: number | null): string => {
    if (level === null || !Number.isFinite(level) || level <= 0) {
        return T.published.rangeUnknown;
    }
    const tenths = level * TENTHS;
    const rounded = Math.round(tenths);
    return Math.abs(tenths - rounded) < 1e-6
        ? T.published.range(`${rounded} из ${TENTHS}`)
        : T.published.rangePct(Math.round(level * HUNDREDTHS));
};

/** Доля «k из n»: десятые; если с целью совпадает при разных долях — сотые. */
const shareOf = (
    share: number,
    target: number | null,
): { hit: number; targetHit: number | null; of: number } => {
    const tenth = (value: number) => Math.round(value * TENTHS);
    const collide =
        target !== null && share !== target && tenth(share) === tenth(target);
    const of = collide ? HUNDREDTHS : TENTHS;
    return {
        hit: Math.round(share * of),
        targetHit: target === null ? null : Math.round(target * of),
        of,
    };
};

/**
 * Сравнение с простыми правилами: причина бэка важнее точечной оценки.
 * «Точнее» — ошибка меньше, чем у «по темпу с начала месяца» и у
 * «среднего за три месяца» (когда оно есть).
 */
const compareText = (
    forecast: Pick<AiForecast, 'shadow' | 'reasons'>,
): string => {
    const backtest = forecast.shadow.backtest;
    if (
        !backtest ||
        (backtest.maseNaive === null && backtest.maseMean3 === null)
    ) {
        return T.accuracy.noCompare;
    }
    if (forecast.reasons.includes(R.FORECAST_MASE)) return T.accuracy.notBetter;
    const { maseNaive, maseMean3 } = backtest;
    const better =
        maseNaive !== null &&
        maseNaive < 1 &&
        (maseMean3 === null || maseMean3 < 1);
    return better ? T.accuracy.better : T.accuracy.notBetter;
};

/**
 * Последняя проверка точности на истории — одно предложение словами. Нет
 * проверки — без порога показа: он не порог проверки (она идёт ежемесячно).
 */
export const aiForecastAccuracyText = (
    forecast: Pick<AiForecast, 'shadow' | 'reasons'>,
): string => {
    const { backtest } = forecast.shadow;
    if (!backtest) return T.accuracy.notChecked;
    if (backtest.status === 'insufficient') {
        return T.accuracy.insufficient(backtest.months);
    }
    const parts: string[] = [];
    if (backtest.coverageShare !== null) {
        const { hit, targetHit, of } = shareOf(
            backtest.coverageShare,
            backtest.coverageTarget,
        );
        const coverage = T.accuracy.coverage(
            hit,
            of,
            pluralRu(hit, AI_FORECAST_CASE_FORMS),
        );
        parts.push(
            targetHit === null
                ? coverage
                : `${coverage} (${T.accuracy.coverageTarget(targetHit, of)})`,
        );
    }
    parts.push(compareText(forecast));
    return T.accuracy.sentence(backtest.months, parts.join('; '));
};

const shadowTodo = (forecast: AiForecast): string => {
    const has = (code: string) => forecast.reasons.includes(code);
    if (has(R.FORECAST_DISABLED)) return T.shadow.todoEnable;
    if (has(R.FORECAST_READINESS_BELOW)) return T.shadow.todoReadiness;
    const notStarted =
        forecast.asOf === null &&
        forecast.shadow.monthsLogged === 0 &&
        forecast.shadow.backtest === null;
    return notStarted ? T.shadow.todoStart : T.shadow.todoWait;
};

const buildShadow = (
    forecast: AiForecast,
    today: string,
): AiForecastShadowView => {
    const { monthsLogged, minMonths } = forecast.shadow;
    const logged = Math.max(0, Math.min(monthsLogged, minMonths));
    const ready = aiForecastReadyDate(today, monthsLogged, minMonths);
    return {
        kind: 'shadow',
        progressTitle: T.shadow.progress(
            logged,
            minMonths,
            pluralRu(minMonths, AI_FORECAST_MONTH_OF_FORMS),
        ),
        progress: { value: logged, target: minMonths },
        share: minMonths > 0 ? logged / minMonths : 0,
        eta: ready ? T.shadow.eta(formatAiFullDate(ready)) : null,
        stageReady: forecast.reasons.includes(R.FORECAST_DISABLED),
        explain: T.shadow.explain,
        accuracy: aiForecastAccuracyText(forecast),
        todo: shadowTodo(forecast),
        theory: 'forecastShadow',
    };
};

const formatRange = (
    band: AiForecastBand,
    formatValue: (value: number) => string,
): string => `${formatValue(band.low)} – ${formatValue(band.high)}`;

/** Простые прогнозы для подсказки: null — строки нет (не ноль). */
export const aiForecastCompareLines = (
    forecast: Pick<AiForecast, 'naive' | 'mean3'>,
): string[] => {
    const lines: string[] = [];
    if (forecast.naive !== null) {
        lines.push(T.published.naive(formatAiDailyForecast(forecast.naive)));
    }
    if (forecast.mean3 !== null) {
        lines.push(T.published.mean3(formatAiDailyForecast(forecast.mean3)));
    }
    return lines.length ? lines : [T.published.compareNone];
};

/** Пометка к деньгам: чек по умолчанию или уточнённый; свой — без пометки. */
export const aiForecastMoneyNote = (
    checkSource: AiForecast['checkSource'] | undefined,
): string | null =>
    checkSource === 'default' || checkSource === 'shrunk'
        ? T.published.moneyCheck[checkSource]
        : null;

const buildPublished = (
    forecast: AiForecast,
    band: AiForecastBand,
): AiForecastPublishedView => {
    const month = formatAiMonthLabel(forecast.monthKey);
    return {
        kind: 'published',
        period: forecast.asOf
            ? `${month} · ${T.published.asOf(formatAiFullDate(forecast.asOf))}`
            : month,
        middle: formatAiDailyCountWith(band.p50, AI_DAILY_PLAN_FORECAST_FORMS),
        low: formatAiDailyCount(band.low),
        high: formatAiDailyCount(band.high),
        rangeCaption: formatAiForecastLevel(forecast.level),
        money: forecast.money
            ? {
                  middle: formatAiMoneyCompact(forecast.money.p50),
                  range: formatRange(forecast.money, formatAiMoneyCompact),
                  note: aiForecastMoneyNote(forecast.checkSource),
              }
            : null,
        done:
            forecast.done === null
                ? null
                : formatAiDailyCountWith(
                      forecast.done,
                      AI_DAILY_PLAN_FORECAST_FORMS,
                  ),
        compareLines: aiForecastCompareLines(forecast),
        accuracy: aiForecastAccuracyText(forecast),
        todo: T.published.todo,
        theory: 'forecast',
    };
};

/**
 * Вид карточки. В тени вилку не показываем вовсе (и простые прогнозы тоже —
 * их легко принять за прогноз). Включён, но вилки нет — честная заглушка.
 */
export const buildAiForecastView = (
    forecast: AiForecast,
    today: string,
): AiForecastView => {
    if (forecast.mode !== 'published') return buildShadow(forecast, today);
    return forecast.band
        ? buildPublished(forecast, forecast.band)
        : { kind: 'empty', text: T.empty };
};
