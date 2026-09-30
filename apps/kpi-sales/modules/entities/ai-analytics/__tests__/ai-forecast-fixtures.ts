import type { AiForecast, AiForecastBacktest } from '../model';

/*
 * Фикстуры прогноза отдела (Фаза 4, POST ai-analytics/forecast) — форма
 * AiForecastDto, как её отдаёт бэк. По умолчанию — режим «в тени»: 4 из 9
 * месяцев, проверки точности ещё не было, вилки и денег нет.
 */

/** Сводка проверки точности: пройдена, факт в вилке 8 из 10, точнее простых. */
export const forecastBacktest = (
    overrides: Partial<AiForecastBacktest> = {},
): AiForecastBacktest => ({
    monthKey: '2026-08',
    status: 'pass',
    coverageShare: 0.8,
    coverageCi90: [0.72, 0.86],
    coverageTarget: 0.8,
    maseNaive: 0.82,
    maseMean3: 0.9,
    maseMax: 1,
    months: 9,
    days: 190,
    ...overrides,
});

/** Прогноз «в тени»: журнал копится, причина — мало теневых месяцев. */
export const shadowForecast = (
    overrides: Partial<AiForecast> = {},
): AiForecast => ({
    mode: 'shadow',
    monthKey: '2026-09',
    asOf: '2026-09-28',
    level: 0.8,
    band: null,
    money: null,
    checkSource: null,
    done: 21,
    naive: 44,
    mean3: 41.3,
    shadow: { monthsLogged: 4, minMonths: 9, backtest: null },
    reasons: ['forecast-shadow-months-below-9'],
    ...overrides,
});

/** Прогноз «включён»: вилка 38–55, середина 46, деньги по своему чеку. */
export const publishedForecast = (
    overrides: Partial<AiForecast> = {},
): AiForecast => ({
    ...shadowForecast(),
    mode: 'published',
    band: { low: 38, p50: 46, high: 55 },
    money: { low: 3_800_000, p50: 4_600_000, high: 5_500_000 },
    checkSource: 'estimated',
    shadow: { monthsLogged: 9, minMonths: 9, backtest: forecastBacktest() },
    reasons: [],
    ...overrides,
});
