import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
import { PORTAL_VIEW_TEXT } from '../consts/portal-view.texts';
import { startPortalViewListener } from '../model/listeners/portal-view.listener';
import { portalViewReducer } from '../model/portal-view-slice';
import { savePortalView } from '../model/portal-view-thunks';
import {
    selectCanEditPortalView,
    selectHiddenTabs,
    selectPortalViewRequest,
} from '../model/portal-view.selectors';
import type { PortalViewResponse } from '../model/types';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { fetchPortalView, savePortalViewSettings } = vi.hoisted(() => ({
    fetchPortalView: vi.fn(),
    savePortalViewSettings: vi.fn(),
}));

vi.mock('../lib/api/portal-view-api', () => ({
    fetchPortalView,
    savePortalViewSettings,
}));

const RESPONSE: PortalViewResponse = {
    view: {
        tabsHidden: ['digest'],
        chartsEnabled: false,
        badgesMain: ['b1'],
        labels: { 'ev:presentation_plan': 'Назначенная презентация' },
        plansEvents: false,
        plansMerged: false,
        plansCallings: false,
        planColumnsHidden: [],
        updatedBy: 'Иванов Иван',
        updatedAt: '2026-11-20T09:30:00.000Z',
    },
    canEdit: true,
    supportUrl: 'https://t.me/support',
    options: {
        tabs: [{ code: 'digest', name: 'Дайджест', common: true }],
        badges: [
            {
                id: 'b1',
                title: 'Презентация',
                hint: null,
                group: 'general',
                callTypes: [],
                mainByDefault: true,
            },
        ],
        methodology: null,
        indicators: [],
    },
};

const USER = { ID: 42, LAST_NAME: 'Тест' } as unknown as BXUser;
const OTHER_USER = { ID: 99, LAST_NAME: 'Другой' } as unknown as BXUser;
const DOMAIN = 'test.bitrix24.ru';

const makeStore = () => {
    const listener = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            portalView: portalViewReducer,
        }),
        middleware: getDefault => getDefault().prepend(listener.middleware),
    });
    startPortalViewListener(
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

const openApp = async (store: ReturnType<typeof makeStore>) => {
    store.dispatch(appActions.setAppData({ domain: DOMAIN, user: USER }));
    await flush();
};

const forbidden = () => ({
    message: 'Request failed with status code 403',
    response: { status: 403, data: { resultCode: 1, message: 'Forbidden' } },
});

describe('portal-view listener — загрузка', () => {
    beforeEach(() => {
        fetchPortalView.mockReset();
        savePortalViewSettings.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('до ответа бэка ничего не скрыто, графики включены, лишних кнопок нет', () => {
        const state = makeStore().getState().portalView;
        expect(state.loaded).toBe(false);
        expect(state.view.tabsHidden).toEqual([]);
        expect(state.view.chartsEnabled).toBe(true);
        expect(state.view.badgesMain).toEqual([]);
        expect(state.canEdit).toBe(false);
        expect(state.supportUrl).toBeNull();
        expect(state.options).toBeNull();
        expect(state.saving).toBe(false);
        expect(state.error).toBeNull();
    });

    it('setAppData → запрос от имени реального пользователя → настройки в сторе', async () => {
        fetchPortalView.mockResolvedValue(RESPONSE);
        const store = makeStore();
        await openApp(store);

        expect(fetchPortalView).toHaveBeenCalledTimes(1);
        expect(fetchPortalView).toHaveBeenCalledWith({
            domain: DOMAIN,
            requesterUserId: '42',
        });
        const state = store.getState().portalView;
        expect(state.loaded).toBe(true);
        expect(state.loadFailed).toBe(false);
        expect(state.view).toEqual(RESPONSE.view);
        expect(state.canEdit).toBe(true);
        expect(state.supportUrl).toBe('https://t.me/support');
        expect(state.options).toEqual(RESPONSE.options);
        expect(selectHiddenTabs(store.getState())).toEqual(['digest']);
    });

    it('сбой загрузки: безопасные значения, приложение живо, одно предупреждение', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        fetchPortalView.mockRejectedValue(new Error('404'));
        const store = makeStore();
        await openApp(store);

        const state = store.getState().portalView;
        expect(state.loaded).toBe(true);
        expect(state.loadFailed).toBe(true);
        expect(state.view.tabsHidden).toEqual([]);
        expect(state.view.chartsEnabled).toBe(true);
        expect(state.canEdit).toBe(false);
        expect(state.supportUrl).toBeNull();
        expect(selectCanEditPortalView(store.getState())).toBe(false);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(store.getState().app.initialized).toBe(true);
    });

    it('без портала запроса нет', async () => {
        fetchPortalView.mockResolvedValue(RESPONSE);
        const store = makeStore();
        store.dispatch(appActions.setAppData({ domain: '', user: USER }));
        await flush();
        expect(fetchPortalView).not.toHaveBeenCalled();
        expect(store.getState().portalView.loaded).toBe(false);
    });

    it('«Смотреть как…» настройки не перечитывает и права на правку гасит', async () => {
        fetchPortalView.mockResolvedValue(RESPONSE);
        const store = makeStore();
        await openApp(store);
        expect(selectCanEditPortalView(store.getState())).toBe(true);

        store.dispatch(appActions.setViewAsUser(OTHER_USER));
        await flush();

        expect(fetchPortalView).toHaveBeenCalledTimes(1);
        expect(store.getState().portalView.canEdit).toBe(true);
        expect(selectCanEditPortalView(store.getState())).toBe(false);
        // Спрашиваем и пишем всегда от реального пользователя сессии.
        expect(selectPortalViewRequest(store.getState())).toEqual({
            domain: DOMAIN,
            requesterUserId: '42',
        });
    });

    it('публичная страница — спрашивать некого', async () => {
        const store = makeStore();
        store.dispatch(appActions.setPublicMode(true));
        await openApp(store);
        expect(fetchPortalView).not.toHaveBeenCalled();
    });
});

describe('savePortalView', () => {
    beforeEach(() => {
        fetchPortalView.mockReset();
        savePortalViewSettings.mockReset();
        fetchPortalView.mockResolvedValue(RESPONSE);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('успех: состояние заменяется ответом бэка, запрос — от реального пользователя', async () => {
        const saved: PortalViewResponse = {
            ...RESPONSE,
            view: {
                ...RESPONSE.view,
                tabsHidden: ['digest', 'finance'],
                updatedBy: 'Петров Пётр',
            },
        };
        savePortalViewSettings.mockResolvedValue(saved);
        const store = makeStore();
        await openApp(store);

        const ok = await store.dispatch(savePortalView({ tabsHidden: ['digest', 'finance'] }));

        expect(ok).toBe(true);
        expect(savePortalViewSettings).toHaveBeenCalledWith({
            domain: DOMAIN,
            requesterUserId: '42',
            tabsHidden: ['digest', 'finance'],
        });
        const state = store.getState().portalView;
        expect(state.view).toEqual(saved.view);
        expect(state.saving).toBe(false);
        expect(state.error).toBeNull();
    });

    it('403: настройки остаются прежними, в сторе — понятный текст', async () => {
        savePortalViewSettings.mockRejectedValue(forbidden());
        const store = makeStore();
        await openApp(store);

        const ok = await store.dispatch(savePortalView({ chartsEnabled: true }));

        expect(ok).toBe(false);
        const state = store.getState().portalView;
        expect(state.view).toEqual(RESPONSE.view);
        expect(state.saving).toBe(false);
        expect(state.error).toBe('Настройки отчёта меняет руководитель группы и выше');
    });

    it('сбой сети: запасной текст без технических слов', async () => {
        savePortalViewSettings.mockRejectedValue(new Error('Network Error'));
        const store = makeStore();
        await openApp(store);

        await store.dispatch(savePortalView({ chartsEnabled: true }));

        expect(store.getState().portalView.error).toBe(PORTAL_VIEW_TEXT.errors.saveFailed);
    });

    it('новая попытка снимает прежнюю ошибку', async () => {
        savePortalViewSettings.mockRejectedValueOnce(forbidden());
        savePortalViewSettings.mockResolvedValueOnce(RESPONSE);
        const store = makeStore();
        await openApp(store);

        await store.dispatch(savePortalView({ chartsEnabled: true }));
        expect(store.getState().portalView.error).not.toBeNull();

        await store.dispatch(savePortalView({ chartsEnabled: true }));
        expect(store.getState().portalView.error).toBeNull();
    });

    it('в режиме «Смотреть как…» запрос не уходит', async () => {
        const store = makeStore();
        await openApp(store);
        store.dispatch(appActions.setViewAsUser(OTHER_USER));

        const ok = await store.dispatch(savePortalView({ chartsEnabled: true }));

        expect(ok).toBe(false);
        expect(savePortalViewSettings).not.toHaveBeenCalled();
        expect(store.getState().portalView.error).toBe(PORTAL_VIEW_TEXT.errors.forbidden);
    });

    it('без права на правку запрос не уходит', async () => {
        fetchPortalView.mockResolvedValue({ ...RESPONSE, canEdit: false });
        const store = makeStore();
        await openApp(store);

        const ok = await store.dispatch(savePortalView({ chartsEnabled: true }));

        expect(ok).toBe(false);
        expect(savePortalViewSettings).not.toHaveBeenCalled();
    });

    it('до инициализации приложения запрос не уходит', async () => {
        const store = makeStore();
        const ok = await store.dispatch(savePortalView({ chartsEnabled: true }));
        expect(ok).toBe(false);
        expect(savePortalViewSettings).not.toHaveBeenCalled();
        expect(store.getState().portalView.error).toBe(PORTAL_VIEW_TEXT.errors.noSession);
    });
});
