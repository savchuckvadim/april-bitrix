import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getEventSalesSettings } = vi.hoisted(() => ({
    getEventSalesSettings: vi.fn(),
}));

vi.mock('../../lib/api/app-config-helper', () => ({
    AppConfigHelper: class {
        getEventSalesSettings = (domain: string) =>
            getEventSalesSettings(domain);
    },
}));

import type { UnknownAction } from '@reduxjs/toolkit';
import { resetSwrCacheRuntime, swrCache } from '@workspace/api';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { APP_FROM_ENUM, appActions, appReducer } from '../slice/AppSlice';
import {
    expireAppConfigCache,
    getAppConfigCacheKey,
} from '../../lib/cache/app-config-cache';
import {
    mountFakeWindow,
    unmountFakeWindow,
} from '../../lib/cache/browser-storage.fake';
import { waitForAppConfig } from '../../lib/utills/app-config-wait';
import { fetchAppConfig } from './AppConfigThunk';

/**
 * Портальные настройки на кэше «отдай старое, обнови в фоне».
 *
 * Что здесь защищается:
 * 1. кэш ускоряет первый экран — `isConfigFetched` поднимается по кэшу, не
 *    дожидаясь сети, и `waitForAppConfig` перестаёт держать первый запрос дел;
 * 2. контур «группа задач приехала позже» цел — фоновое обновление с другим
 *    `taskGroupId` даёт ВТОРОЙ `mergeConfig`, по которому листенер
 *    перезапрашивает список дел (инцидент 27.08);
 * 3. неудача обновления не отбирает уже действующие настройки;
 * 4. признак «задано на портале» (`storedKeys`) работает на обоих путях —
 *    и на кэше, и на сети, — а без него фрейм ведёт себя как раньше.
 *
 * Моки без `storedKeys` — это НЕ забывчивость, а сценарий «новый фрейм +
 * старый бэк»: они обязаны оставаться зелёными, пока жив запасной путь.
 */

/** Домен из doмen-хардкода: taskGroupId 41 — видно, когда портал не применился. */
const DOMAIN = 'gsr.bitrix24.ru';
const DOMAIN_TASK_GROUP = 41;

type Settings = Record<string, unknown>;
type ThunkLike = (
    dispatch: AppDispatch,
    getState: AppGetState,
    extra: never,
) => unknown;

/** Мини-стор поверх настоящего appReducer: экшены копятся, состояние живое. */
const makeStore = () => {
    let state = appReducer(undefined, { type: '@@init' });
    const actions: UnknownAction[] = [];

    const getState = (() => ({ app: state })) as unknown as AppGetState;
    const dispatch = ((action: UnknownAction | ThunkLike) => {
        if (typeof action === 'function') {
            return action(dispatch, getState, undefined as never);
        }
        actions.push(action);
        state = appReducer(state, action);
        return action;
    }) as AppDispatch;

    // Контекст встройки: именно он задаёт домен и доменный конфиг.
    dispatch(
        appActions.setAppData({
            domain: DOMAIN,
            user: null,
            placement: null,
            deal: null,
            company: null,
            lead: null,
            display: APP_DISPLAY_MODE.PUBLIC,
            task: null,
            from: APP_FROM_ENUM.COMPANY,
        }),
    );

    return {
        dispatch,
        getState,
        app: () => state,
        mergeConfigs: () =>
            actions
                .filter(action => action.type === appActions.mergeConfig.type)
                .map(
                    action =>
                        (action as unknown as { payload: Settings }).payload,
                ),
    };
};

/** Отложенный ответ сети: позволяет проверить состояние ДО его прихода. */
const defer = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
};

/** Отпускаем очередь микро- и макрозадач: фоновое обновление успевает лечь. */
const flush = async (times = 4): Promise<void> => {
    for (let i = 0; i < times; i += 1) {
        await new Promise(resolve => setTimeout(resolve, 0));
    }
};

const warmCache = (settings: Settings) =>
    swrCache.write<Settings>(getAppConfigCacheKey(DOMAIN), settings);

beforeEach(() => {
    getEventSalesSettings.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    mountFakeWindow();
    resetSwrCacheRuntime();
});

afterEach(() => {
    vi.restoreAllMocks();
    unmountFakeWindow();
    resetSwrCacheRuntime();
});

describe('fetchAppConfig — пустой кэш', () => {
    it('идёт в сеть, применяет настройки и складывает их в кэш', async () => {
        getEventSalesSettings.mockResolvedValue({
            taskGroupId: 77,
            withChecklistPay: true,
        });

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        expect(store.app().config.taskGroupId).toBe(77);
        expect(store.app().config.withChecklistPay).toBe(true);
        expect(store.app().isConfigFetched).toBe(true);

        const entry = await swrCache.read<Settings>(
            getAppConfigCacheKey(DOMAIN),
        );

        expect(entry?.value).toMatchObject({ taskGroupId: 77 });
    });

    it('сеть упала — действует хардкод по домену, гейт всё равно отпущен', async () => {
        getEventSalesSettings.mockRejectedValue(new Error('502'));

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        expect(store.app().config.taskGroupId).toBe(DOMAIN_TASK_GROUP);
        expect(store.app().configPortalKeys).toEqual([]);
        expect(store.app().isConfigFetched).toBe(true);
        expect(store.mergeConfigs()).toHaveLength(0);
    });

    it('домен не известен — в сеть не ходим и гейт не держим', async () => {
        const store = makeStore();
        await store.dispatch(fetchAppConfig(''));

        expect(getEventSalesSettings).not.toHaveBeenCalled();
        expect(store.app().isConfigFetched).toBe(true);
    });
});

describe('fetchAppConfig — кэш ускоряет первый экран', () => {
    it('настройки из кэша применяются, пока сеть ещё висит', async () => {
        await warmCache({ taskGroupId: 77 });

        const pending = defer<Settings>();
        getEventSalesSettings.mockReturnValue(pending.promise);

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        // сеть ещё не ответила, а настройки уже действуют
        expect(store.app().config.taskGroupId).toBe(77);
        expect(store.app().configPortalKeys).toContain('taskGroupId');
        expect(store.app().isConfigFetched).toBe(true);

        // ...и ожидание, державшее первый запрос дел до 1.5 с, проходит насквозь
        await waitForAppConfig(store.getState);
        expect(store.app().isConfigFetched).toBe(true);

        pending.resolve({ taskGroupId: 77 });
        await flush();
    });

    it('сеть упала при живом кэше — настройки остаются, ошибки нет', async () => {
        await warmCache({ taskGroupId: 77 });
        getEventSalesSettings.mockRejectedValue(new Error('нет сети'));

        const store = makeStore();
        await expect(
            store.dispatch(fetchAppConfig(DOMAIN)),
        ).resolves.toBeUndefined();
        await flush();

        expect(store.app().config.taskGroupId).toBe(77);
        expect(store.app().isConfigFetched).toBe(true);

        // кэш не тронут: следующий старт снова поднимется на нём
        const entry = await swrCache.read<Settings>(
            getAppConfigCacheKey(DOMAIN),
        );

        expect(entry?.value).toMatchObject({ taskGroupId: 77 });
    });
});

describe('fetchAppConfig — фоновое обновление', () => {
    it('другая группа задач приезжает вторым mergeConfig (перезапрос дел)', async () => {
        await warmCache({ taskGroupId: 77 });
        getEventSalesSettings.mockResolvedValue({ taskGroupId: 88 });

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        // на кэше ушли с 77 — именно с этим значением уйдёт первый запрос дел
        expect(store.mergeConfigs()).toEqual([{ taskGroupId: 77 }]);

        await flush();

        // фоновое обновление принесло другую группу: это и есть тот экшен,
        // по которому листенер перезапрашивает список дел
        expect(store.mergeConfigs()).toEqual([
            { taskGroupId: 77 },
            { taskGroupId: 88 },
        ]);
        expect(store.app().config.taskGroupId).toBe(88);
    });

    it('те же настройки не будят перезапрос дел', async () => {
        await warmCache({ taskGroupId: 77 });
        getEventSalesSettings.mockResolvedValue({ taskGroupId: 77 });

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));
        await flush();

        expect(getEventSalesSettings).toHaveBeenCalledTimes(1);
        expect(store.mergeConfigs()).toEqual([{ taskGroupId: 77 }]);
    });

    it('включённая на портале анкета доезжает в ту же сессию', async () => {
        await warmCache({ withChecklistPay: false });
        getEventSalesSettings.mockResolvedValue({ withChecklistPay: true });

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        expect(store.app().config.withChecklistPay).toBe(false);

        await flush();

        expect(store.app().config.withChecklistPay).toBe(true);
    });
});

describe('fetchAppConfig — признак «задано на портале»', () => {
    it('владелец выключил доменный флаг в админке — флаг гаснет', async () => {
        getEventSalesSettings.mockResolvedValue({
            withTM: false,
            storedKeys: ['withTM'],
        });

        const store = makeStore();

        // gsr: withTM включён доменным дефолтом. Раз ключ в storedKeys —
        // это решение владельца, и оно сильнее.
        expect(store.app().config.withTM).toBe(true);

        await store.dispatch(fetchAppConfig(DOMAIN));

        expect(store.app().config.withTM).toBe(false);
        expect(store.app().configPortalKeys).toContain('withTM');
    });

    it('на портале не трогали — доменный флаг живёт (боевое гашение)', async () => {
        // Тот же ответ бэка, но withTM в нём ДЕФОЛТ реестра, а не решение:
        // ровно так гасли withNoPlan на gsirk и withTM на gsr.
        getEventSalesSettings.mockResolvedValue({
            withTM: false,
            withNoPlan: false,
            taskGroupId: 41,
            storedKeys: [],
        });

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        expect(store.app().config.withTM).toBe(true);
        expect(store.app().configPortalKeys).toEqual([]);
        expect(store.mergeConfigs()).toHaveLength(0);
    });

    it('диагностика видит источником портал только заданное', async () => {
        // taskGroupId приехал дефолтом реестра и совпал с доменным — портал
        // его не задавал, и «источник: портал» было бы враньём.
        getEventSalesSettings.mockResolvedValue({
            taskGroupId: DOMAIN_TASK_GROUP,
            withChecklistPay: true,
            storedKeys: ['withChecklistPay'],
        });

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        expect(store.app().configPortalKeys).toEqual(['withChecklistPay']);
        expect(store.app().config.taskGroupId).toBe(DOMAIN_TASK_GROUP);
    });

    it('в кэше запись старого формата — решает то, что привезла сеть', async () => {
        // Первый старт после деплоя бэка: кэш без признака отрабатывает по
        // запасному пути (доменный флаг цел), а сеть привозит признак и
        // применяет решение владельца.
        await warmCache({ withTM: false });
        getEventSalesSettings.mockResolvedValue({
            withTM: false,
            storedKeys: ['withTM'],
        });

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        expect(store.app().config.withTM).toBe(true);

        await flush();

        expect(store.app().config.withTM).toBe(false);
        expect(store.mergeConfigs()).toEqual([{ withTM: false }]);
    });

    it('признак едет в кэш вместе со значениями', async () => {
        getEventSalesSettings.mockResolvedValue({
            withTM: false,
            storedKeys: ['withTM'],
        });

        const store = makeStore();
        await store.dispatch(fetchAppConfig(DOMAIN));

        const entry = await swrCache.read<Settings>(
            getAppConfigCacheKey(DOMAIN),
        );

        // Иначе на следующем старте правило «применяем только заданное»
        // начало бы врать: кэш вернул бы одни значения.
        expect(entry?.value).toMatchObject({ storedKeys: ['withTM'] });
    });
});

describe('expireAppConfigCache', () => {
    it('помечает запись протухшей, но настройки оставляет рабочими', async () => {
        await warmCache({ taskGroupId: 77 });
        await expireAppConfigCache(DOMAIN);

        const entry = await swrCache.read<Settings>(
            getAppConfigCacheKey(DOMAIN),
        );

        expect(entry?.value).toMatchObject({ taskGroupId: 77 });
        expect(entry?.isStale).toBe(true);
    });
});
