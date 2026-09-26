import { beforeEach, describe, expect, it, vi } from 'vitest';
import { aiAnalyticsActions } from '../model/ai-analytics-slice';
import {
    AI_DAILY_PLAN_DISABLED_MESSAGE,
    fetchAiDailyPlan,
    fetchAiStyleProfile,
} from '../model/ai-analytics-thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import type { AiAnalyticsSettings } from '../model';
import { dailyPlan, httpError, ready, styleCard } from './ai-fixtures';
import { makeAiStore, TEST_REQUESTER } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getDailyPlan, getStyleProfile } = vi.hoisted(() => ({
    getDailyPlan: vi.fn(),
    getStyleProfile: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getDailyPlan = getDailyPlan;
        getStyleProfile = getStyleProfile;
    },
}));

const PLAN_DISABLED_403 =
    'План дня выключен на портале: включите признак «План дня…»';

/** Настройки с выключенным планом дня (остальные поля не важны). */
const settingsWithPlan = (dailyPlanEnabled: boolean): AiAnalyticsSettings =>
    ({ dailyPlanEnabled }) as unknown as AiAnalyticsSettings;

describe('fetchAiDailyPlan — план дня менеджера', () => {
    beforeEach(() => {
        getDailyPlan.mockReset();
    });

    it('ready: секция с данными, запрос запомнен, ключ несёт менеджера и дату', async () => {
        getDailyPlan.mockResolvedValue(ready(dailyPlan(), 'plan-key'));
        const store = makeAiStore();
        await store.dispatch(
            fetchAiDailyPlan({ managerId: '7', date: '2026-09-22' }),
        );

        const section = store.getState().aiAnalytics.dailyPlan;
        expect(section.status).toBe('ready');
        expect(section.serverKey).toBe('plan-key');
        expect(section.data?.items[0]?.requiredToday).toBe(12);
        expect(section.requestKey).toBe(
            buildAiRequestKey({
                ...TEST_REQUESTER,
                extra: ['plan', '7', '2026-09-22'],
            }),
        );
        expect(store.getState().aiAnalytics.dailyPlanQuery).toEqual({
            managerId: '7',
            date: '2026-09-22',
        });
        expect(getDailyPlan).toHaveBeenCalledWith(TEST_REQUESTER, {
            managerId: '7',
            date: '2026-09-22',
        });
    });

    it('без даты — сервер берёт сегодня; смена даты меняет ключ и шлёт новый POST', async () => {
        getDailyPlan.mockResolvedValue(ready(dailyPlan()));
        const store = makeAiStore();
        await store.dispatch(fetchAiDailyPlan({ managerId: '7' }));
        await store.dispatch(fetchAiDailyPlan({ managerId: '7' })); // тот же ключ, ready
        expect(getDailyPlan).toHaveBeenCalledTimes(1);
        expect(getDailyPlan.mock.calls[0]?.[1]).toEqual({ managerId: '7' });

        await store.dispatch(
            fetchAiDailyPlan({ managerId: '7', date: '2026-09-23' }),
        );
        expect(getDailyPlan).toHaveBeenCalledTimes(2);
    });

    it('403 при выключенной настройке → status error с текстом сервера, без исключения', async () => {
        getDailyPlan.mockRejectedValue(httpError(403, PLAN_DISABLED_403));
        const store = makeAiStore();
        await expect(
            store.dispatch(fetchAiDailyPlan({ managerId: '7' })),
        ).resolves.toBeUndefined();

        const section = store.getState().aiAnalytics.dailyPlan;
        expect(section.status).toBe('error');
        expect(section.error).toBe(PLAN_DISABLED_403);
        expect(section.data).toBeNull();
    });

    it('гейт на фронте: settings.dailyPlanEnabled = false — запроса нет, секция в error с подсказкой', async () => {
        const store = makeAiStore();
        store.dispatch(
            aiAnalyticsActions.sectionPending({
                section: 'settings',
                requestKey: 's',
            }),
        );
        store.dispatch(
            aiAnalyticsActions.sectionReady({
                section: 'settings',
                data: settingsWithPlan(false),
                requestKey: 's',
                serverKey: 's',
            }),
        );
        await store.dispatch(fetchAiDailyPlan({ managerId: '7' }));
        expect(getDailyPlan).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.dailyPlan.status).toBe('error');
        expect(store.getState().aiAnalytics.dailyPlan.error).toBe(
            AI_DAILY_PLAN_DISABLED_MESSAGE,
        );
        expect(store.getState().aiAnalytics.dailyPlanQuery?.managerId).toBe(
            '7',
        );
    });

    it('error-конверт → error с сообщением; повтор с force шлёт POST снова', async () => {
        getDailyPlan
            .mockResolvedValueOnce({
                status: 'error',
                requestKey: 'k',
                message: 'Нет месяца менеджера',
            })
            .mockResolvedValueOnce(ready(dailyPlan()));
        const store = makeAiStore();
        await store.dispatch(fetchAiDailyPlan({ managerId: '7' }));
        expect(store.getState().aiAnalytics.dailyPlan.error).toBe(
            'Нет месяца менеджера',
        );
        await store.dispatch(fetchAiDailyPlan({ managerId: '7' }, true));
        expect(store.getState().aiAnalytics.dailyPlan.status).toBe('ready');
    });
});

describe('fetchAiStyleProfile — карточка стиля менеджера', () => {
    beforeEach(() => {
        getStyleProfile.mockReset();
    });

    it('ready: карточка в data, запрос запомнен, ключ несёт менеджера и месяц', async () => {
        getStyleProfile.mockResolvedValue(
            ready(styleCard(), 'style:7:2026-08'),
        );
        const store = makeAiStore();
        await store.dispatch(
            fetchAiStyleProfile({ managerId: '7', month: '2026-08' }),
        );

        const section = store.getState().aiAnalytics.style;
        expect(section.status).toBe('ready');
        expect(section.data?.status).toBe('ready');
        expect(section.data?.notable).toEqual(['Долгие разговоры']);
        expect(section.requestKey).toBe(
            buildAiRequestKey({
                ...TEST_REQUESTER,
                extra: ['style', '7', '2026-08'],
            }),
        );
        expect(store.getState().aiAnalytics.styleQuery).toEqual({
            managerId: '7',
            month: '2026-08',
        });
        expect(getStyleProfile).toHaveBeenCalledWith(TEST_REQUESTER, {
            managerId: '7',
            month: '2026-08',
        });
    });

    it('opt_out — это состояние карточки: секция ready, данные с note', async () => {
        getStyleProfile.mockResolvedValue(
            ready(
                styleCard({
                    status: 'opt_out',
                    profile: null,
                    notable: [],
                    axes: [],
                    note: 'Сотрудник отказался от профилирования',
                }),
            ),
        );
        const store = makeAiStore();
        await store.dispatch(fetchAiStyleProfile({ managerId: '7' }));
        const section = store.getState().aiAnalytics.style;
        expect(section.status).toBe('ready');
        expect(section.data?.status).toBe('opt_out');
        expect(section.data?.note).toContain('отказался');
    });

    it('403 (менеджер вне периметра) → status error с текстом сервера', async () => {
        getStyleProfile.mockRejectedValue(
            httpError(403, 'Менеджер вне периметра видимости пользователя'),
        );
        const store = makeAiStore();
        await store.dispatch(fetchAiStyleProfile({ managerId: '99' }));
        expect(store.getState().aiAnalytics.style.status).toBe('error');
        expect(store.getState().aiAnalytics.style.error).toBe(
            'Менеджер вне периметра видимости пользователя',
        );
    });

    it('смена менеджера — новый ключ и новый POST; тот же — гард', async () => {
        getStyleProfile.mockResolvedValue(ready(styleCard()));
        const store = makeAiStore();
        await store.dispatch(fetchAiStyleProfile({ managerId: '7' }));
        await store.dispatch(fetchAiStyleProfile({ managerId: '7' }));
        expect(getStyleProfile).toHaveBeenCalledTimes(1);
        await store.dispatch(fetchAiStyleProfile({ managerId: '3' }));
        expect(getStyleProfile).toHaveBeenCalledTimes(2);
    });
});
