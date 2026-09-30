import { describe, expect, it } from 'vitest';
import {
    forecastBacktest,
    publishedForecast,
    shadowForecast,
} from '@/modules/entities/ai-analytics/__tests__/ai-forecast-fixtures';
import { AI_FORECAST_TEXT } from '../ai-forecast.texts';
import {
    aiForecastAccuracyText,
    aiForecastCompareLines,
    aiForecastReadyDate,
    buildAiForecastView,
    formatAiForecastLevel,
    type AiForecastPublishedView,
    type AiForecastShadowView,
} from '../ai-forecast.util';

const TODAY = '2026-09-29';
// Неразрывный пробел ru-RU: сравниваем без учёта вида пробелов.
const plain = (value: string) => value.replace(/\s/g, ' ');
/** Английских кодов, стрелок и формул на экране быть не должно. */
const FORBIDDEN = /[a-z]{3,}|→|×|≥|≤|σ|κ|β|P10|P90/;

const shadowView = (
    ...args: Parameters<typeof shadowForecast>
): AiForecastShadowView => {
    const view = buildAiForecastView(shadowForecast(...args), TODAY);
    if (view.kind !== 'shadow') throw new Error(view.kind);
    return view;
};

const publishedView = (
    ...args: Parameters<typeof publishedForecast>
): AiForecastPublishedView => {
    const view = buildAiForecastView(publishedForecast(...args), TODAY);
    if (view.kind !== 'published') throw new Error(view.kind);
    return view;
};

describe('уровень вилки и срок готовности', () => {
    it('уровень из ответа: 0,8 — «8 из 10», 0,9 — «9 из 10», нецелые десятые — проценты', () => {
        expect(formatAiForecastLevel(0.8)).toBe(
            'Примерно 8 из 10 месяцев факт попадает в этот диапазон.',
        );
        expect(formatAiForecastLevel(0.9)).toContain('9 из 10');
        expect(formatAiForecastLevel(0.85)).toBe(
            'Примерно в 85 % месяцев факт попадает в этот диапазон.',
        );
    });

    it('уровня нет (null, 0, не число) — «в большинстве месяцев», не ноль', () => {
        for (const level of [null, 0, Number.NaN]) {
            expect(formatAiForecastLevel(level)).toBe(
                AI_FORECAST_TEXT.published.rangeUnknown,
            );
        }
    });

    it('дата готовности: 1-е число через (нужно − есть) месяцев', () => {
        expect(aiForecastReadyDate(TODAY, 4, 9)).toBe('2027-02-01');
        expect(aiForecastReadyDate('2026-12-15', 8, 9)).toBe('2027-01-01');
    });

    it('уже набрано или дата битая — срока нет', () => {
        expect(aiForecastReadyDate(TODAY, 9, 9)).toBeNull();
        expect(aiForecastReadyDate(TODAY, 12, 9)).toBeNull();
        expect(aiForecastReadyDate('не дата', 1, 9)).toBeNull();
    });
});

describe('точность на истории словами', () => {
    it('проверки ещё не было — первая сверка после закрытия месяца, без порога показа', () => {
        expect(aiForecastAccuracyText(shadowForecast())).toBe(
            'Точность ещё не проверяли: первая сверка с фактом будет после закрытия месяца, а оценим точность, когда закрытых месяцев наберётся достаточно.',
        );
    });

    it('мало истории — честно «мало», без чисел попадания', () => {
        const forecast = shadowForecast({
            shadow: {
                monthsLogged: 4,
                minMonths: 9,
                backtest: forecastBacktest({
                    status: 'insufficient',
                    months: 4,
                    coverageShare: null,
                }),
            },
        });
        expect(aiForecastAccuracyText(forecast)).toBe(
            'Для проверки точности пока мало истории: сверено с фактом 4 мес.',
        );
    });

    it('пройдена: «7 из 10» против цели и «точнее простого правила»', () => {
        const forecast = shadowForecast({
            shadow: {
                monthsLogged: 9,
                minMonths: 9,
                backtest: forecastBacktest({ coverageShare: 0.7 }),
            },
            reasons: ['forecast-coverage-outside'],
        });
        expect(aiForecastAccuracyText(forecast)).toBe(
            'Проверка на истории за 9 мес.: факт попадал в вилку в 7 случаях из 10 (нужно 8 из 10); прогноз точнее простого правила «по темпу с начала месяца».',
        );
    });

    it('доля и цель совпали бы в десятых — показываем сотые, без противоречия', () => {
        const forecast = shadowForecast({
            shadow: {
                monthsLogged: 9,
                minMonths: 9,
                backtest: forecastBacktest({ coverageShare: 0.78 }),
            },
        });
        expect(aiForecastAccuracyText(forecast)).toContain(
            'в 78 случаях из 100 (нужно 80 из 100)',
        );
    });

    it('причина «не точнее простых правил» важнее точечной оценки', () => {
        const forecast = shadowForecast({
            shadow: {
                monthsLogged: 9,
                minMonths: 9,
                backtest: forecastBacktest({ status: 'fail', maseNaive: 0.95 }),
            },
            reasons: ['forecast-mase-not-below'],
        });
        expect(aiForecastAccuracyText(forecast)).toContain(
            AI_FORECAST_TEXT.accuracy.notBetter,
        );
    });

    it('«по темпу с начала месяца» побит, «среднее за три месяца» — нет: не «точнее»', () => {
        const forecast = shadowForecast({
            shadow: {
                monthsLogged: 9,
                minMonths: 9,
                backtest: forecastBacktest({ maseNaive: 0.8, maseMean3: 1.1 }),
            },
            reasons: [],
        });
        expect(aiForecastAccuracyText(forecast)).toContain(
            'пока не точнее простых правил — продолжаем проверять',
        );
    });

    it('проверки не было: без порога показа — проверка идёт после каждого закрытого месяца', () => {
        const of = (minMonths: number) =>
            aiForecastAccuracyText(
                shadowForecast({
                    shadow: { monthsLogged: 0, minMonths, backtest: null },
                }),
            );
        expect(of(9)).toBe(AI_FORECAST_TEXT.accuracy.notChecked);
        expect(of(9)).not.toMatch(/d/);
    });

    it('сравнить не с чем — так и пишем; нет доли попаданий — без неё', () => {
        const forecast = shadowForecast({
            shadow: {
                monthsLogged: 9,
                minMonths: 9,
                backtest: forecastBacktest({
                    status: 'fail',
                    coverageShare: null,
                    maseNaive: null,
                    maseMean3: null,
                }),
            },
        });
        expect(aiForecastAccuracyText(forecast)).toBe(
            'Проверка на истории за 9 мес.: сравнить с простыми правилами пока не на чем.',
        );
    });
});

describe('карточка: режим «в тени»', () => {
    it('прогресс «4 из 9 месяцев», срок, «ждать», вилки нет, тема теории', () => {
        const view = shadowView();
        expect(view.progressTitle).toBe(
            'Прогноз копится в тени: 4 из 9 месяцев',
        );
        expect(view.progress).toEqual({ value: 4, target: 9 });
        expect(view.share).toBeCloseTo(4 / 9);
        expect(view.eta).toBe('История для проверки наберётся к 01.02.2027');
        expect(view.todo).toBe(AI_FORECAST_TEXT.shadow.todoWait);
        expect(view.todo).toContain('попросить разработчика включить показ');
        expect(view.stageReady).toBe(false);
        expect(view.theory).toBe('forecastShadow');
        // Вилку и простые прогнозы в тени не показываем: их легко принять за прогноз.
        expect(view).not.toHaveProperty('middle');
        expect(view).not.toHaveProperty('compareLines');
        expect(JSON.stringify(view)).not.toMatch(/\d+ продаж|≈/);
    });

    it('журнала ещё нет — «начнёт копиться после ночного расчёта», 0 из 9', () => {
        const view = shadowView({
            asOf: null,
            shadow: { monthsLogged: 0, minMonths: 9, backtest: null },
            reasons: ['forecast-log-missing'],
        });
        expect(view.progressTitle).toBe(
            'Прогноз копится в тени: 0 из 9 месяцев',
        );
        expect(view.todo).toBe(AI_FORECAST_TEXT.shadow.todoStart);
        expect(view.todo).toContain('попросите разработчика включить показ');
    });

    it('проверка пройдена, показ выключен — «попросите разработчика», срока нет', () => {
        const shadow = {
            monthsLogged: 9,
            minMonths: 9,
            backtest: forecastBacktest(),
        };
        const view = shadowView({
            shadow,
            reasons: ['forecast-stage-disabled'],
        });
        expect(view.stageReady).toBe(true);
        expect(view.eta).toBeNull();
        expect(view.todo).toBe(AI_FORECAST_TEXT.shadow.todoEnable);
        expect(view.progressTitle).toContain('9 из 9 месяцев');
        // Готовность портала ниже «прогноза» — не «ждать проверку».
        const below = shadowView({
            shadow,
            reasons: ['forecast-readiness-below'],
        });
        expect(below.stageReady).toBe(false);
        expect(below.todo).toBe(AI_FORECAST_TEXT.shadow.todoReadiness);
    });

    it('месяцев больше нужного — прогресс не выше цели; «1 месяца» склоняется', () => {
        const view = shadowView({
            shadow: { monthsLogged: 3, minMonths: 1, backtest: null },
        });
        expect(view.progressTitle).toBe(
            'Прогноз копится в тени: 1 из 1 месяца',
        );
        expect(view.share).toBe(1);
    });
});

describe('карточка: режим «включён»', () => {
    it('середина, границы, уровень, деньги, сделано, период', () => {
        const view = publishedView();
        expect(view.middle).toBe('46 продаж');
        expect(view.low).toBe('38');
        expect(view.high).toBe('55');
        expect(view.rangeCaption).toBe(
            'Примерно 8 из 10 месяцев факт попадает в этот диапазон.',
        );
        expect(plain(view.money?.middle ?? '')).toBe('4,6 млн ₽');
        expect(plain(view.money?.range ?? '')).toBe('3,8 млн ₽ – 5,5 млн ₽');
        expect(view.done).toBe('21 продажа');
        expect(view.period).toBe('сентябрь 2026 · по данным на 28.09.2026');
        expect(view.theory).toBe('forecast');
    });

    it('чека нет, сделано неизвестно — null, а не ноль', () => {
        const view = publishedView({ money: null, done: null, asOf: null });
        expect(view.money).toBeNull();
        expect(view.done).toBeNull();
        expect(view.period).toBe('сентябрь 2026');
    });

    it('простые прогнозы — только присланные; нет обоих — честная строка', () => {
        expect(aiForecastCompareLines({ naive: 44, mean3: 41.3 })).toEqual([
            'по темпу с начала месяца — ≈44 продажи',
            'в среднем за три прошлых месяца — ≈41 продажа',
        ]);
        expect(aiForecastCompareLines({ naive: null, mean3: 41.3 })).toEqual([
            'в среднем за три прошлых месяца — ≈41 продажа',
        ]);
        expect(aiForecastCompareLines({ naive: null, mean3: null })).toEqual([
            AI_FORECAST_TEXT.published.compareNone,
        ]);
    });

    it('включён, но вилки нет — заглушка, не нули', () => {
        const view = buildAiForecastView(
            publishedForecast({ band: null }),
            TODAY,
        );
        expect(view).toEqual({ kind: 'empty', text: AI_FORECAST_TEXT.empty });
    });

    it('тексты карточки — по-русски, без кодов, стрелок и формул', () => {
        const texts = [
            ...Object.values(shadowView()),
            ...Object.values(publishedView()),
        ].filter((value): value is string => typeof value === 'string');
        const shown = texts.filter(
            text => !['forecast', 'forecastShadow', 'shadow', 'published'].includes(text),
        );
        for (const text of shown) expect(text).not.toMatch(FORBIDDEN);
    });
});
