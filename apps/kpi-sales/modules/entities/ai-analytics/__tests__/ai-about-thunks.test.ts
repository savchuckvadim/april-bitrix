import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appActions } from '@/modules/app/model/AppSlice';
import { aiAnalyticsActions } from '../model/ai-analytics-slice';
import { fetchAiAbout } from '../model/ai-analytics-thunks';
import { about, httpError, ready } from './ai-fixtures';
import { makeAiStore, TEST_REQUESTER } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getAbout } = vi.hoisted(() => ({ getAbout: vi.fn() }));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getAbout = getAbout;
    },
}));

describe('fetchAiAbout — «Как считаем», кэш по ручке', () => {
    beforeEach(() => {
        getAbout.mockReset();
    });

    it('ready: секция по endpoint с данными и серверным ключом', async () => {
        getAbout.mockResolvedValue(ready(about(), 'srv-about'));
        const store = makeAiStore();
        await store.dispatch(fetchAiAbout('overview'));

        const section = store.getState().aiAnalytics.about.overview;
        expect(section?.status).toBe('ready');
        expect(section?.serverKey).toBe('srv-about');
        expect(section?.data?.params[0]?.code).toBe('min_calls');
        expect(section?.data?.model).toBeNull();
        expect(getAbout).toHaveBeenCalledWith(TEST_REQUESTER, 'overview');
    });

    it('повторно не запрашивает, пока ready; force — перечитывает', async () => {
        getAbout.mockResolvedValue(ready(about()));
        const store = makeAiStore();
        await store.dispatch(fetchAiAbout('overview'));
        await store.dispatch(fetchAiAbout('overview'));
        expect(getAbout).toHaveBeenCalledTimes(1);
        await store.dispatch(fetchAiAbout('overview', true));
        expect(getAbout).toHaveBeenCalledTimes(2);
    });

    it('разные ручки — независимые секции', async () => {
        getAbout
            .mockResolvedValueOnce(ready(about()))
            .mockResolvedValueOnce(
                ready(about({ endpoint: 'plan/daily', title: 'План дня' })),
            );
        const store = makeAiStore();
        await store.dispatch(fetchAiAbout('overview'));
        await store.dispatch(fetchAiAbout('plan/daily'));
        expect(getAbout).toHaveBeenCalledTimes(2);
        const { about: cache } = store.getState().aiAnalytics;
        expect(cache.overview?.data?.title).toContain('Обзор');
        expect(cache['plan/daily']?.data?.title).toBe('План дня');
        expect(cache.brief).toBeUndefined();
    });

    it('пока грузится — второй POST по той же ручке не шлём', async () => {
        let resolveFirst: (value: unknown) => void = () => undefined;
        getAbout.mockImplementationOnce(
            () =>
                new Promise(resolve => {
                    resolveFirst = resolve;
                }),
        );
        const store = makeAiStore();
        const first = store.dispatch(fetchAiAbout('brief'));
        expect(store.getState().aiAnalytics.about.brief?.status).toBe(
            'loading',
        );
        await store.dispatch(fetchAiAbout('brief'));
        resolveFirst(ready(about({ endpoint: 'brief' })));
        await first;
        expect(getAbout).toHaveBeenCalledTimes(1);
        expect(store.getState().aiAnalytics.about.brief?.status).toBe('ready');
    });

    it('403 → секция ручки в error с текстом сервера; следующий вызов повторяет', async () => {
        getAbout
            .mockRejectedValueOnce(httpError(403, 'Нет прав'))
            .mockResolvedValueOnce(ready(about({ endpoint: 'manager/style' })));
        const store = makeAiStore();
        await store.dispatch(fetchAiAbout('manager/style'));
        expect(
            store.getState().aiAnalytics.about['manager/style']?.status,
        ).toBe('error');
        expect(store.getState().aiAnalytics.about['manager/style']?.error).toBe(
            'Нет прав',
        );
        await store.dispatch(fetchAiAbout('manager/style'));
        expect(
            store.getState().aiAnalytics.about['manager/style']?.status,
        ).toBe('ready');
    });

    it('resetData очищает кэш; публичная страница — запросов нет', async () => {
        getAbout.mockResolvedValue(ready(about()));
        const store = makeAiStore();
        await store.dispatch(fetchAiAbout('overview'));
        store.dispatch(aiAnalyticsActions.resetData());
        expect(store.getState().aiAnalytics.about).toEqual({});

        store.dispatch(appActions.setPublicMode(true));
        await store.dispatch(fetchAiAbout('overview'));
        expect(getAbout).toHaveBeenCalledTimes(1);
    });
});
