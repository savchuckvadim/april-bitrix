import { describe, expect, it } from 'vitest';
import type { AiDailyPlanRopOnly } from '@/modules/entities/ai-analytics';
import {
    dailyPlan,
    dailyPlanItem,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import { AI_DAILY_PLAN_FORECAST_UNKNOWN } from '../ai-daily-plan-activity.data';
import {
    aiDailyPlanForecastNote,
    buildAiDailyPlanForecast,
} from '../ai-daily-plan-forecast.util';
import { AI_DAILY_PLAN_REASON } from '../ai-daily-plan.util';
import { buildAiDailyPlanView } from '../ai-daily-plan-view.util';

// Прогноз месяца руководителю и деградация плана дня (reason ≠ null).

const ropOnly = (
    overrides: Partial<AiDailyPlanRopOnly> = {},
): AiDailyPlanRopOnly => ({
    norm: { value: 0.2, n: 120, w: 0.6, confidence: { level: 'ok' } },
    normAtRefQuality: null,
    betaSource: 'none',
    gExpected: 2.1,
    gCeiling: 4.4,
    ...overrides,
});

/** Две строки: главная утечка — КП (priority 1). */
const twoItems = () => [
    dailyPlanItem({ priority: 2 }),
    dailyPlanItem({
        callType: 'offer_to_invoice',
        title: 'КП',
        requiredToday: 1,
        priority: 1,
    }),
];

/** План по объёму: бэк отдаёт G′ = G′ потолка, cap = null. */
const degraded = (
    reason: NonNullable<ReturnType<typeof dailyPlan>['reason']>,
) =>
    dailyPlan({
        reason,
        requiredVolume: null,
        pipelineExpected: null,
        items: twoItems().map(item => ({ ...item, cap: null })),
        ropOnly: ropOnly({ gExpected: 4, gCeiling: 4 }),
    });

describe('прогноз месяца руководителю', () => {
    it('полные данные — числа «≈N продаж», фразы нет', () => {
        expect(
            buildAiDailyPlanForecast(dailyPlan({ ropOnly: ropOnly() })),
        ).toEqual({
            forecast: { expected: '≈2 продажи', best: '≈4 продажи' },
            note: null,
        });
    });

    it('менеджеру блока нет — ни чисел, ни фразы', () => {
        expect(buildAiDailyPlanForecast(dailyPlan())).toEqual({
            forecast: null,
            note: null,
        });
        expect(
            aiDailyPlanForecastNote(dailyPlan({ reason: 'forecast-missing' })),
        ).toBeNull();
    });

    it('нет модели портала или дневного прогноза — «прогноз не оценён»', () => {
        expect(
            buildAiDailyPlanForecast(degraded('portal-model-missing')),
        ).toEqual({
            forecast: null,
            note: AI_DAILY_PLAN_FORECAST_UNKNOWN.modelMissing,
        });
        expect(aiDailyPlanForecastNote(degraded('forecast-missing'))).toBe(
            AI_DAILY_PLAN_FORECAST_UNKNOWN.forecastMissing,
        );
    });

    it('числа совпали и cap нет — не оценён; совпали при cap — это прогноз', () => {
        const same = ropOnly({ gExpected: 3, gCeiling: 3 });
        expect(
            aiDailyPlanForecastNote(
                dailyPlan({
                    ropOnly: same,
                    items: [dailyPlanItem({ cap: null })],
                }),
            ),
        ).toBe(AI_DAILY_PLAN_FORECAST_UNKNOWN.noCap);
        expect(
            aiDailyPlanForecastNote(dailyPlan({ ropOnly: same })),
        ).toBeNull();
    });
});

describe('деградация в модели карточки', () => {
    it('план ночного прогноза — «узкое место» у priority 1', () => {
        const view = buildAiDailyPlanView(dailyPlan({ items: twoItems() }));
        expect(view.rows.map(row => row.topLeak)).toEqual([false, true]);
        expect(view.reasonText).toBeNull();
    });

    it('reason = null, но N_req не посчитан (план по объёму) — «узкого места» нет', () => {
        const view = buildAiDailyPlanView(
            dailyPlan({ items: twoItems(), requiredVolume: null }),
        );
        expect(view.rows.some(row => row.topLeak)).toBe(false);
    });

    it('план по объёму — без «узкого места», с причиной и без чисел прогноза', () => {
        const view = buildAiDailyPlanView(degraded('portal-model-missing'));
        expect(view.rows.some(row => row.topLeak)).toBe(false);
        expect(view.reasonText).toBe(
            AI_DAILY_PLAN_REASON['portal-model-missing'],
        );
        expect(view.forecast).toBeNull();
        expect(view.forecastNote).toBe(
            'Прогноз не оценён — модели портала ещё нет.',
        );
    });

    it('цели нет — причина деградации всё равно в модели', () => {
        const view = buildAiDailyPlanView({
            ...degraded('forecast-missing'),
            target: { sales: 0, source: 'median', warnings: ['target-empty'] },
        });
        expect(view.state).toBe('no-target');
        expect(view.reasonText).toBe(AI_DAILY_PLAN_REASON['forecast-missing']);
        expect(view.forecastNote).toBe(
            AI_DAILY_PLAN_FORECAST_UNKNOWN.forecastMissing,
        );
    });
});
