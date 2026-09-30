import { describe, expect, it } from 'vitest';
import type {
    AiAboutForecastAccuracy,
    AiAboutRecommendationsEffect,
} from '@/modules/entities/ai-analytics/model';
import { AI_ABOUT_UNKNOWN_REASON } from '../lib/ai-about-phase4.util';
import {
    aiAboutCoverageHint,
    buildAiAboutForecastAccuracy,
    buildAiAboutRecommendationsEffect,
    formatAiAboutCoverage,
    formatAiAboutErrorRatio,
    formatAiAboutGoodhart,
} from '../lib/ai-about-phase4-checks.util';
import { formatAiAboutEdgeEffect } from '../lib/ai-about-phase4-edge.util';
import { expectClientTexts, valueOf } from './ai-about-phase4.fixtures';

const accuracy = (
    over: Partial<AiAboutForecastAccuracy> = {},
): AiAboutForecastAccuracy => ({
    monthKey: '2026-08',
    status: 'fail',
    reasons: ['coverage-below', 'mase-naive', 'unknown-code' as never],
    shadowMonths: 2,
    shadowMinMonths: 3,
    coverage: { value: 0.85, low: 0.78, high: 0.9, n: 30 },
    coverageTarget: 0.9,
    errorVsLastMonth: { value: 0.8, low: 0.65, high: 0.95 },
    errorVsMean3: { value: 1.05, low: 0.9, high: 1.2 },
    errorRatioMax: 1,
    ...over,
});

describe('Точность прогноза на истории', () => {
    it('месяцы без показа N из M, вилка с интервалом, сравнение с простыми правилами', () => {
        const view = buildAiAboutForecastAccuracy(accuracy());
        expect(view.badge.label).toBe('проверка не пройдена');
        expect(valueOf(view, 'Месяцев без показа')).toBe('2 из нужных 3');
        expect(valueOf(view, 'Факт попадал в вилку прогноза')).toBe(
            '85 % дней из 30 (вероятно от 78 до 90 %), цель — 90 %',
        );
        expect(valueOf(view, 'Против правила «по темпу с начала месяца»')).toBe(
            'точнее: ошибка 80 % (вероятно от 65 до 95 %) от ошибки правила',
        );
        expect(valueOf(view, 'Против среднего за три месяца')).toContain(
            'разницу пока не отличить от случайности',
        );
        expect(view.reasons).toEqual([
            'факт реже нужного попадает в вилку прогноза',
            'прогноз не точнее правила «по темпу с начала месяца»',
            AI_ABOUT_UNKNOWN_REASON,
        ]);
        expectClientTexts(view);
    });

    it('подсказка к вилке — от цели покрытия, а не зашитые «девять из десяти»', () => {
        const hintOf = (coverageTarget: number | null) =>
            buildAiAboutForecastAccuracy(accuracy({ coverageTarget })).facts.find(
                item => item.label === 'Факт попадал в вилку прогноза',
            )?.hint;
        expect(hintOf(0.8)).toEqual([
            'Вилка — диапазон, в который продажи месяца должны попадать примерно в 8 случаях из 10.',
        ]);
        expect(hintOf(0.9)?.[0]).toContain('примерно в 9 случаях из 10');
        expect(aiAboutCoverageHint(null)).toContain('в большинстве случаев');
        expect(aiAboutCoverageHint(0.01)).toContain('в большинстве случаев');
    });

    it('нет проверки — «не проверялось» / «не считалось»; мало дней — «мало данных»', () => {
        expect(
            formatAiAboutCoverage({ coverage: null, coverageTarget: null }),
        ).toBe('не проверялось');
        expect(
            formatAiAboutCoverage({
                coverage: { value: null, low: null, high: null, n: 4 },
                coverageTarget: null,
            }),
        ).toBe('мало данных: 4 дня');
        expect(formatAiAboutErrorRatio(null)).toBe('не считалось');
        expect(
            formatAiAboutErrorRatio({ value: 1.3, low: 1.1, high: 1.5 }),
        ).toContain('хуже');
        const pass = buildAiAboutForecastAccuracy(
            accuracy({ status: 'pass', reasons: [] }),
        );
        expect(pass.badge.tone).toBe('success');
        expect(pass.reasons).toEqual([]);
    });
});

const effect = (
    over: Partial<AiAboutRecommendationsEffect> = {},
): AiAboutRecommendationsEffect => ({
    monthKey: '2026-09',
    status: 'insufficient',
    reasons: ['issued-below-min'],
    issued: 12,
    completedWindows: 4,
    done: 5,
    disagree: 1,
    doneShare: { value: 0.42, low: 0.2, high: 0.66, n: 12 },
    disagreeShare: { value: null, low: null, high: null, n: 3 },
    beforeAfter: [
        {
            edge: 'presentation_to_offer',
            before: 0.3,
            after: 0.36,
            diff: { value: 0.06, low: -0.02, high: 0.14 },
            windows: 4,
        },
        {
            edge: 'brand_new_edge',
            before: null,
            after: null,
            diff: null,
            windows: 0,
        },
    ],
    goodhartFlags: 0,
    goodhartManagers: 0,
    ...over,
});

describe('Эффект советов', () => {
    it('выдано / выполнено с интервалом / несогласия, до и после по шагам словами', () => {
        const view = buildAiAboutRecommendationsEffect(effect());
        expect(view.badge.label).toBe('советов пока мало');
        expect(valueOf(view, 'Выдано советов')).toBe('12');
        expect(valueOf(view, 'Выполнено')).toBe(
            '5 — 42 % (вероятно от 20 до 66 %)',
        );
        expect(valueOf(view, 'Несогласий')).toBe('1 — мало данных: 3 совета');
        expect(valueOf(view, 'Из презентации в КП')).toBe(
            'было 30 %, стало 36 %: разница в пределах случайности (+6 пунктов, вероятно от −2 до +14)',
        );
        expect(valueOf(view, 'Другой шаг воронки')).toBe(
            'данных пока нет — сравнить не с чем',
        );
        expect(valueOf(view, 'Признаки подгонки цифр')).toBe('нет');
        expect(view.reasons).toEqual(['советов пока мало']);
        expect(view.todo).toContain('«Сделано»');
        expectClientTexts(view);
    });

    it('подсказка к шагу воронки — окна в месяцах, а не «за месяц»', () => {
        const view = buildAiAboutRecommendationsEffect(effect());
        const hints = view.facts
            .filter(item => item.label === 'Из презентации в КП')
            .flatMap(item => item.hint);
        expect(hints.join(' ')).toContain('за месяцы до совета и после него');
        expect(hints.join(' ')).not.toContain('за месяц до');
    });

    it('шаг вырос уверенно — «стало лучше»; упал — «стало хуже»', () => {
        const base = effect().beforeAfter[0]!;
        expect(
            formatAiAboutEdgeEffect({
                ...base,
                diff: { value: 0.08, low: 0.02, high: 0.14 },
            }),
        ).toContain('стало лучше');
        expect(
            formatAiAboutEdgeEffect({
                ...base,
                diff: { value: -0.08, low: -0.14, high: -0.02 },
            }),
        ).toContain('стало хуже');
        const flagged = buildAiAboutRecommendationsEffect(
            effect({
                status: 'pass',
                reasons: [],
                goodhartFlags: 2,
                goodhartManagers: 2,
            }),
        );
        expect(valueOf(flagged, 'Признаки подгонки цифр')).toBe(
            '2 сигнала у 2 менеджеров',
        );
        expect(flagged.badge.label).toBe('проверка пройдена');
    });

    it('сигналы подгонки и менеджеры — разные числа: 3 сигнала у одного — не «у 3 менеджеров»', () => {
        expect(
            formatAiAboutGoodhart({ goodhartFlags: 3, goodhartManagers: 1 }),
        ).toBe('3 сигнала у 1 менеджера');
        // Старый ответ без числа менеджеров — только сигналы, без «менеджеров».
        expect(formatAiAboutGoodhart({ goodhartFlags: 3 })).toBe('3 сигнала');
        expect(formatAiAboutGoodhart({ goodhartFlags: 0 })).toBe('нет');
    });

    it('мало переходов — бэк не прислал ни долей, ни разницы: «мало данных», без процентов', () => {
        const text = formatAiAboutEdgeEffect({
            edge: 'presentation_to_offer',
            before: null,
            after: null,
            diff: null,
            windows: 1,
        });
        expect(text).toBe('мало данных: 1 сравнение — сравнивать пока рано');
        expect(text).not.toMatch(/%|\d+ пункт/);
        // «До» есть, «после» мало — тоже без процентов.
        const half = formatAiAboutEdgeEffect({
            edge: 'presentation_to_offer',
            before: 0.3,
            after: null,
            diff: null,
            windows: 4,
        });
        expect(half).toBe('мало данных: 4 сравнения — сравнивать пока рано');
        const view = buildAiAboutRecommendationsEffect(
            effect({
                beforeAfter: [
                    {
                        edge: 'presentation_to_offer',
                        before: null,
                        after: null,
                        diff: null,
                        windows: 1,
                    },
                ],
            }),
        );
        expect(valueOf(view, 'Из презентации в КП')).not.toContain('%');
        expectClientTexts(view);
    });

    it('«Не согласен» в «что делать» — у советов, где кнопка теперь есть', () => {
        const fail = buildAiAboutRecommendationsEffect(
            effect({ status: 'fail', reasons: ['disagree-above'] }),
        );
        expect(fail.todo).toContain('«Не согласен»');
        expect(fail.todo).toContain('у советов в таблице менеджеров');
    });
});
