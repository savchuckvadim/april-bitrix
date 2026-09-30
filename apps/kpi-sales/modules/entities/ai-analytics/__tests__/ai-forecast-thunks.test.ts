import { beforeEach, describe, expect, it, vi } from 'vitest';
import { aiAnalyticsActions } from '../model/ai-analytics-slice';
import {
    AI_FORECAST_KEY_PART,
    fetchAiForecast,
} from '../model/ai-analytics-thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import { httpError, ready } from './ai-fixtures';
import { publishedForecast, shadowForecast } from './ai-forecast-fixtures';
import { makeAiStore, TEST_REQUESTER } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getForecast } = vi.hoisted(() => ({ getForecast: vi.fn() }));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getForecast = getForecast;
    },
}));

describe('fetchAiForecast — прогноз отдела (Фаза 4)', () => {
    beforeEach(() => {
        getForecast.mockReset();
    });

    it('ready: секция с данными, серверный ключ, ключ запроса с маркером ручки', async () => {
        getForecast.mockResolvedValue(
            ready(shadowForecast(), 'portal.bitrix24.ru:forecast:2026-09'),
        );
        const store = makeAiStore();
        await store.dispatch(fetchAiForecast());

        const section = store.getState().aiAnalytics.forecast;
        expect(section.status).toBe('ready');
        expect(section.serverKey).toBe('portal.bitrix24.ru:forecast:2026-09');
        expect(section.data?.mode).toBe('shadow');
        expect(section.data?.band).toBeNull();
        expect(section.requestKey).toBe(
            buildAiRequestKey({
                ...TEST_REQUESTER,
                extra: [AI_FORECAST_KEY_PART],
            }),
        );
        expect(getForecast).toHaveBeenCalledWith(TEST_REQUESTER);
    });

    it('гард: готовая секция не шлёт второй POST; force — перечитывает', async () => {
        getForecast
            .mockResolvedValueOnce(ready(shadowForecast()))
            .mockResolvedValueOnce(ready(publishedForecast()));
        const store = makeAiStore();
        await store.dispatch(fetchAiForecast());
        await store.dispatch(fetchAiForecast());
        expect(getForecast).toHaveBeenCalledTimes(1);

        await store.dispatch(fetchAiForecast(true));
        expect(getForecast).toHaveBeenCalledTimes(2);
        expect(store.getState().aiAnalytics.forecast.data?.mode).toBe(
            'published',
        );
    });

    it('403 (не руководитель) → error с текстом сервера; повтор после ошибки идёт', async () => {
        getForecast
            .mockRejectedValueOnce(
                httpError(403, 'Прогноз отдела доступен только руководителям'),
            )
            .mockResolvedValueOnce(ready(shadowForecast()));
        const store = makeAiStore();
        await store.dispatch(fetchAiForecast());
        const failed = store.getState().aiAnalytics.forecast;
        expect(failed.status).toBe('error');
        expect(failed.error).toBe(
            'Прогноз отдела доступен только руководителям',
        );

        await store.dispatch(fetchAiForecast());
        expect(store.getState().aiAnalytics.forecast.status).toBe('ready');
    });

    it('конверт error → ошибка секции с сообщением бэка', async () => {
        getForecast.mockResolvedValue({
            status: 'error',
            requestKey: 'k',
            message: 'Журнал прогноза недоступен',
        });
        const store = makeAiStore();
        await store.dispatch(fetchAiForecast());
        expect(store.getState().aiAnalytics.forecast.error).toBe(
            'Журнал прогноза недоступен',
        );
    });

    it('resetData очищает секцию прогноза', async () => {
        getForecast.mockResolvedValue(ready(shadowForecast()));
        const store = makeAiStore();
        await store.dispatch(fetchAiForecast());
        store.dispatch(aiAnalyticsActions.resetData());
        expect(store.getState().aiAnalytics.forecast.status).toBe('idle');
        expect(store.getState().aiAnalytics.forecast.data).toBeNull();
    });
});
