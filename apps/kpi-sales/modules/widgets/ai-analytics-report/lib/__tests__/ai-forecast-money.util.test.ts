import { describe, expect, it } from 'vitest';
import { publishedForecast } from '@/modules/entities/ai-analytics/__tests__/ai-forecast-fixtures';
import { AI_FORECAST_TEXT } from '../ai-forecast.texts';
import { aiForecastMoneyNote, buildAiForecastView } from '../ai-forecast.util';

/*
 * Деньги в карточке «Прогноз отдела»: чек не свой (по умолчанию или
 * уточнённый по типичному) — у суммы пометка, а подсказка не называет чек
 * «средним» (он логнормальный, показана медиана).
 */

const T = AI_FORECAST_TEXT.published;

const moneyOf = (...args: Parameters<typeof publishedForecast>) => {
    const view = buildAiForecastView(publishedForecast(...args), '2026-09-29');
    if (view.kind !== 'published') throw new Error(view.kind);
    return view.money;
};

describe('карточка прогноза: источник чека', () => {
    it('чек по умолчанию — пометка «по типичному чеку, а не по вашему»', () => {
        expect(moneyOf({ checkSource: 'default' })?.note).toBe(
            T.moneyCheck.default,
        );
        expect(T.moneyCheck.default).toContain('не по вашему');
    });

    it('уточнённый чек — своя пометка; свой или неизвестен — без пометки', () => {
        expect(moneyOf({ checkSource: 'shrunk' })?.note).toBe(
            T.moneyCheck.shrunk,
        );
        expect(moneyOf({ checkSource: 'estimated' })?.note).toBeNull();
        expect(moneyOf({ checkSource: null })?.note).toBeNull();
        expect(aiForecastMoneyNote(undefined)).toBeNull();
    });

    it('денег нет — и пометки нет', () => {
        expect(moneyOf({ money: null, checkSource: 'default' })).toBeNull();
    });

    it('подсказка не называет чек средним', () => {
        expect(T.moneyHint).not.toContain('среднему чеку');
        expect(T.moneyHint).toContain('обычному чеку');
        expect(T.moneyMissing).not.toContain('среднего');
    });
});
