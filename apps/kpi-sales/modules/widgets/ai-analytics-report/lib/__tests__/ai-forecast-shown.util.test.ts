import { describe, expect, it } from 'vitest';
import type { AiForecast } from '@/modules/entities/ai-analytics';
import {
    publishedForecast,
    shadowForecast,
} from '@/modules/entities/ai-analytics/__tests__/ai-forecast-fixtures';
import { buildAiForecastShown } from '../ai-forecast-shown.util';
import { buildAiForecastView } from '../ai-forecast.util';

type Shown = NonNullable<AiForecast['shown']>;

const shownOf = (shown: Shown) => buildAiForecastShown(shadowForecast({ shown }));

describe('число прогноза с пометкой, пока вилка не опубликована', () => {
    it('расчёт по темпу: подписан как простой расчёт, не как прогноз модели', () => {
        const view = shownOf({ source: 'naive', value: 44, note: 'history-short' });
        expect(view).toMatchObject({
            value: '≈44 продажи',
            title: 'Расчёт по темпу с начала месяца',
            badge: 'простой расчёт',
            badgeTone: 'info',
            done: '21 продажа',
        });
        expect(view?.note).toContain('простой расчёт, а не прогноз модели');
        expect(view?.period).toContain('сентябрь 2026');
        expect(view?.period).toContain('28.09.2026');
    });

    it('простой расчёт точнее модели: показано среднее за три месяца', () => {
        const view = shownOf({ source: 'mean3', value: 41.3, note: 'simple-better' });
        expect(view?.title).toBe('Среднее за три прошлых месяца');
        expect(view?.value).toBe('≈41 продажа');
        expect(view?.note).toContain('оказался точнее');
    });

    it('модель без подтверждённой точности — с предупреждением', () => {
        const view = shownOf({
            source: 'model',
            value: 46,
            note: 'model-unconfirmed',
        });
        expect(view).toMatchObject({
            title: 'Прогноз модели',
            badge: 'точность не подтверждена',
            badgeTone: 'warning',
        });
    });

    it('проверка пройдена, показ не включён — число модели, границы позже', () => {
        const view = shownOf({ source: 'model', value: 46, note: 'stage-disabled' });
        expect(view?.badgeTone).toBe('success');
        expect(view?.note).toContain('границ');
    });

    it('портал не готов к прогнозу — расчёт по темпу и что сделать', () => {
        const view = shownOf({
            source: 'naive',
            value: 44,
            note: 'readiness-below',
        });
        expect(view?.note).toContain('плашке готовности');
    });

    it('меньше одной продажи — «<1», без «≈»', () => {
        expect(
            shownOf({ source: 'naive', value: 0.4, note: 'history-short' })?.value,
        ).toBe('<1 продажи');
    });

    it('числа нет (журнала дня нет или старый бэкенд) — показывать нечего', () => {
        expect(buildAiForecastShown(shadowForecast({ shown: null }))).toBeNull();
        const legacy = { ...shadowForecast() } as Partial<AiForecast>;
        delete legacy.shown;
        expect(buildAiForecastShown(legacy as AiForecast)).toBeNull();
    });

    it('вид карточки «в тени» несёт число; опубликованный — вилку как раньше', () => {
        const shadow = buildAiForecastView(shadowForecast(), '2026-09-28');
        expect(shadow.kind).toBe('shadow');
        expect(shadow.kind === 'shadow' && shadow.shown?.value).toBe(
            '≈44 продажи',
        );
        const published = buildAiForecastView(publishedForecast(), '2026-09-28');
        expect(published.kind).toBe('published');
    });
});
