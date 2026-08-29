import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { resetSwrCacheRuntime, setConfig, swrCache } from '@workspace/api';
import {
    expirePortalCache,
    getPortalCacheKey,
    portalActions,
    portalAPI,
    portalReducer,
    resetPortalCacheRuntime,
} from '@workspace/pbx';
import type { Portal } from '@workspace/pbx';
import {
    mountFakeWindow,
    unmountFakeWindow,
} from '../cache/browser-storage.fake';

/**
 * Слепок портала на кэше «отдай старое, обнови в фоне».
 *
 * Тест идёт через настоящий `portalAPI` (тот же вызов, что в `app-init`),
 * настоящий `swr-cache` поверх подделки localStorage и подменённый `fetch`.
 *
 * Что здесь защищается — три беды прежней схемы:
 * 1. вчерашняя запись сносилась ДО запроса: сеть легла → фрейм оставался
 *    вообще без конфигурации портала;
 * 2. попадание в кэш не приводило к запросу вовсе: правка на портале не
 *    доезжала до конца календарных суток;
 * 3. ключ не содержал ни домена, ни приложения, ни версии схемы.
 */

const DOMAIN = 'gsr.bitrix24.ru';
const OTHER_DOMAIN = 'april-dev.bitrix24.ru';

/** Слепок ровно той формы, на которую опирается резолв полей. */
const makePortal = (title: string): Portal =>
    ({
        bitrixCallingTasksGroup: { bitrixId: 41 },
        company: { bitrixfields: [{ code: 'op_inn', title }] },
    }) as unknown as Portal;

const OLD_PORTAL = makePortal('вчерашний');
const NEW_PORTAL = makePortal('переустановленный');

const fetchMock = vi.fn();

/** Ответ бэка `/front/portal`. */
const respondWith = (portal: Portal) =>
    fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ resultCode: 0, data: { portal } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }),
    );

const makeStore = () => {
    const actions: UnknownAction[] = [];
    const collect: Middleware = () => next => action => {
        actions.push(action as UnknownAction);
        return next(action);
    };

    const store = configureStore({
        reducer: {
            portal: portalReducer,
            [portalAPI.reducerPath]: portalAPI.reducer,
        },
        middleware: getDefault =>
            getDefault({ serializableCheck: false })
                .concat(collect)
                .concat(portalAPI.middleware),
    });

    return {
        store,
        portal: () => store.getState().portal.portal,
        fetchPortal: (domain = DOMAIN) =>
            store.dispatch(
                portalAPI.endpoints.fetchPortal.initiate({ domain }),
            ),
        setPortalCount: () =>
            actions.filter(
                action => action.type === portalActions.setPortal.type,
            ).length,
    };
};

/** Отпускаем очередь задач: фоновое обновление успевает доехать. */
const flush = async (times = 4): Promise<void> => {
    for (let i = 0; i < times; i += 1) {
        await new Promise(resolve => setTimeout(resolve, 0));
    }
};

const warmCache = (portal: Portal, domain = DOMAIN) =>
    swrCache.write<Portal>(getPortalCacheKey(domain), portal);

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mountFakeWindow();
    resetSwrCacheRuntime();
    resetPortalCacheRuntime();
    // Как в app/components/api-provider.tsx: приложение в ключе кэша.
    setConfig({ appId: 'event-sales' });
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    unmountFakeWindow();
    resetSwrCacheRuntime();
    resetPortalCacheRuntime();
});

describe('fetchPortal — пустой кэш', () => {
    it('идёт в сеть, кладёт слепок в стор и в кэш', async () => {
        respondWith(NEW_PORTAL);

        const app = makeStore();
        await app.fetchPortal();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(app.portal()).toEqual(NEW_PORTAL);

        const entry = await swrCache.read<Portal>(getPortalCacheKey(DOMAIN));

        expect(entry?.value).toEqual(NEW_PORTAL);
    });

    it('сеть упала — честная ошибка, слепка нет', async () => {
        fetchMock.mockRejectedValue(new TypeError('fetch failed'));

        const app = makeStore();
        const result = await app.fetchPortal();

        expect('error' in result).toBe(true);
        expect(app.portal()).toBeNull();
    });
});

describe('fetchPortal — свежий кэш', () => {
    it('отдаёт слепок из кэша и сеть не трогает', async () => {
        await warmCache(OLD_PORTAL);
        respondWith(NEW_PORTAL);

        const app = makeStore();
        await app.fetchPortal();
        await flush();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(app.portal()).toEqual(OLD_PORTAL);
    });

    it('чужой домен своей записи не видит', async () => {
        await warmCache(OLD_PORTAL, OTHER_DOMAIN);
        respondWith(NEW_PORTAL);

        const app = makeStore();
        await app.fetchPortal(DOMAIN);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(app.portal()).toEqual(NEW_PORTAL);
        // запись соседнего домена на месте — её никто не трогал
        expect(
            (await swrCache.read<Portal>(getPortalCacheKey(OTHER_DOMAIN)))
                ?.value,
        ).toEqual(OLD_PORTAL);
    });
});

describe('fetchPortal — кэш помечен протухшим (⟳ / переустановка полей)', () => {
    it('старый слепок работает сразу, новый доезжает фоном', async () => {
        await warmCache(OLD_PORTAL);
        await expirePortalCache(DOMAIN);
        respondWith(NEW_PORTAL);

        const app = makeStore();
        await app.fetchPortal();

        // на экране уже есть с чем работать, до всякой сети
        expect(app.portal()).toEqual(OLD_PORTAL);

        await flush();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(app.portal()).toEqual(NEW_PORTAL);
        expect(
            (await swrCache.read<Portal>(getPortalCacheKey(DOMAIN)))?.value,
        ).toEqual(NEW_PORTAL);
    });

    it('сеть упала — прежний слепок остаётся и в сторе, и в кэше', async () => {
        await warmCache(OLD_PORTAL);
        await expirePortalCache(DOMAIN);
        fetchMock.mockRejectedValue(new TypeError('fetch failed'));

        const app = makeStore();
        const result = await app.fetchPortal();
        await flush();

        // наружу ошибка не летит: работать есть с чем
        expect('error' in result).toBe(false);
        expect(app.portal()).toEqual(OLD_PORTAL);
        expect(
            (await swrCache.read<Portal>(getPortalCacheKey(DOMAIN)))?.value,
        ).toEqual(OLD_PORTAL);
    });

    it('resultCode ≠ 0 прежний слепок не затирает', async () => {
        await warmCache(OLD_PORTAL);
        await expirePortalCache(DOMAIN);
        fetchMock.mockResolvedValue(
            new Response(
                JSON.stringify({ resultCode: 1, message: 'портал не найден' }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                },
            ),
        );

        const app = makeStore();
        await app.fetchPortal();
        await flush();

        expect(app.portal()).toEqual(OLD_PORTAL);
        expect(
            (await swrCache.read<Portal>(getPortalCacheKey(DOMAIN)))?.value,
        ).toEqual(OLD_PORTAL);
    });

    it('тот же слепок второй раз стор не будит', async () => {
        await warmCache(OLD_PORTAL);
        await expirePortalCache(DOMAIN);
        respondWith(OLD_PORTAL);

        const app = makeStore();
        await app.fetchPortal();
        await flush();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        // setPortal ровно один: повтор разбудил бы инициализацию компании,
        // сбор контактов и гвард чужой задачи на ровном месте
        expect(app.setPortalCount()).toBe(1);
    });
});

describe('fetchPortal — уборка легаси-кэша', () => {
    it('мёртвые записи portal_cache_* выметаются после получения слепка', async () => {
        const storage = mountFakeWindow();
        resetSwrCacheRuntime();
        storage.setItem('portal_cache_812026', 'старый шифрованный слепок');
        respondWith(NEW_PORTAL);

        const app = makeStore();
        await app.fetchPortal();

        expect(storage.getItem('portal_cache_812026')).toBeNull();
        expect(app.portal()).toEqual(NEW_PORTAL);
    });
});

/**
 * Потолок возраста. «Старое переживает падение сети» не означает «старое
 * живёт вечно»: по карте полей слепка идут НЕОБРАТИМЫЕ записи в CRM, поэтому
 * дальше недели слепок к отдаче не годен.
 */
describe('fetchPortal — предельный возраст слепка', () => {
    /** Кладёт слепок в кэш «неделю с лишним назад». */
    const warmAncientCache = async (): Promise<void> => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-07-01T09:00:00Z'));
        await warmCache(OLD_PORTAL);
        vi.setSystemTime(new Date('2026-07-20T09:00:00Z'));
    };

    it('слепок старше недели не отдаётся — ждём сеть', async () => {
        await warmAncientCache();
        respondWith(NEW_PORTAL);

        const app = makeStore();
        await app.fetchPortal();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(app.portal()).toEqual(NEW_PORTAL);
    });

    it('сеть недоступна — работаем без слепка, а не по карте полей 19-дневной давности', async () => {
        await warmAncientCache();
        fetchMock.mockRejectedValue(new TypeError('fetch failed'));

        const app = makeStore();
        const result = await app.fetchPortal();

        // Без слепка запись в поле просто не уходит (findUfKey не даёт ключа),
        // а по устаревшему UF-ключу она прошла бы успешно и молча уехала в
        // поле, которое уже никто не читает.
        expect('error' in result).toBe(true);
        expect(app.portal()).toBeNull();
    });
});
