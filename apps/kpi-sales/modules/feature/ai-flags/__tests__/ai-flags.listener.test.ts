import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { aiAnalyticsReducer } from '@/modules/entities/ai-analytics/model/ai-analytics-slice';
import type { AiAnalyticsSettings } from '@/modules/entities/ai-analytics/model';
import { startAiFlagsListener } from '../model/listeners/ai-flags.listener';

// vi.mock поднимается выше импортов — мок объявляем через vi.hoisted.
const { getSettings } = vi.hoisted(() => ({ getSettings: vi.fn() }));

vi.mock('@/modules/entities/ai-analytics/lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getSettings = getSettings;
    },
}));

const SETTINGS: AiAnalyticsSettings = {
    enabled: true,
    pipelineEnabled: true,
    auditEnabled: false,
    alertsEnabled: true,
    digestEnabled: false,
    readiness: {
        mode: 'calibration',
        historyMonths: 1,
        presentations: 12,
        sales: 0,
        comparableFrom: '',
        reasons: ['мало презентаций'],
    },
    callTypes: [],
    comparableFrom: '',
    ropUserIds: [7],
};

const USER = { ID: 42, LAST_NAME: 'Тест' } as unknown as BXUser;

const makeStore = () => {
    const listener = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            aiAnalytics: aiAnalyticsReducer,
        }),
        middleware: getDefault => getDefault().prepend(listener.middleware),
    });
    startAiFlagsListener(
        listener as ListenerMiddlewareInstance<
            RootState,
            AppDispatch,
            ThunkExtraArgument
        >,
    );
    return store as unknown as {
        dispatch: AppDispatch;
        getState: () => RootState;
    };
};

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('ai-flags listener', () => {
    beforeEach(() => {
        getSettings.mockReset();
    });

    it('setAppData → settings/get → портальный флаг и настройки в сторе', async () => {
        getSettings.mockResolvedValue({
            status: 'ready',
            requestKey: 'k',
            data: SETTINGS,
        });
        const store = makeStore();
        expect(store.getState().app.features.aiAnalyticsPortalEnabled).toBe(
            false,
        );

        store.dispatch(
            appActions.setAppData({ domain: 'test.bitrix24.ru', user: USER }),
        );
        await flush();

        expect(getSettings).toHaveBeenCalledWith({
            domain: 'test.bitrix24.ru',
            requesterUserId: '42',
        });
        expect(store.getState().app.features.aiAnalyticsPortalEnabled).toBe(
            true,
        );
        expect(store.getState().aiAnalytics.settings.status).toBe('ready');
        expect(store.getState().aiAnalytics.settings.data?.ropUserIds).toEqual([
            7,
        ]);
    });

    it('портал выключил ai_analytics_enabled → флаг false', async () => {
        getSettings.mockResolvedValue({
            status: 'ready',
            requestKey: 'k',
            data: { ...SETTINGS, enabled: false },
        });
        const store = makeStore();
        store.dispatch(
            appActions.setAppData({ domain: 'test.bitrix24.ru', user: USER }),
        );
        await flush();
        expect(store.getState().app.features.aiAnalyticsPortalEnabled).toBe(
            false,
        );
    });

    it('ошибка бэка → флаг остаётся false, секция в error', async () => {
        getSettings.mockRejectedValue(new Error('500'));
        const store = makeStore();
        store.dispatch(
            appActions.setAppData({ domain: 'test.bitrix24.ru', user: USER }),
        );
        await flush();
        expect(store.getState().app.features.aiAnalyticsPortalEnabled).toBe(
            false,
        );
        expect(store.getState().aiAnalytics.settings.status).toBe('error');
    });

    it('константа приложения выключена — запроса нет', async () => {
        getSettings.mockResolvedValue({
            status: 'ready',
            requestKey: 'k',
            data: SETTINGS,
        });
        const store = makeStore();
        store.dispatch(appActions.setFeatures({ aiAnalytics: false }));
        store.dispatch(
            appActions.setAppData({ domain: 'test.bitrix24.ru', user: USER }),
        );
        await flush();
        expect(getSettings).not.toHaveBeenCalled();
        expect(store.getState().app.features.aiAnalyticsPortalEnabled).toBe(
            false,
        );
    });

    it('«Смотреть как…» перечитывает настройки от имени просматриваемого', async () => {
        getSettings.mockResolvedValue({
            status: 'ready',
            requestKey: 'k',
            data: SETTINGS,
        });
        const store = makeStore();
        store.dispatch(
            appActions.setAppData({ domain: 'test.bitrix24.ru', user: USER }),
        );
        await flush();
        store.dispatch(
            appActions.setViewAsUser({
                ID: 99,
                LAST_NAME: 'Другой',
            } as unknown as BXUser),
        );
        await flush();
        expect(getSettings).toHaveBeenLastCalledWith({
            domain: 'test.bitrix24.ru',
            requesterUserId: '99',
        });
    });
});
