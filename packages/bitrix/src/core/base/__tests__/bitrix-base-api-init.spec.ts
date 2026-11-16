/**
 * `BitrixBaseApi.init()`: по умолчанию ждёт `user.current`, с `deferUser`
 * возвращается сразу после фрейма — домен уже известен, пользователя отдаёт
 * `whenUser()`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthData } from '@bitrix24/b24jssdk';

const initFrame = vi.hoisted(() => vi.fn());

vi.mock('@bitrix24/b24jssdk', async importOriginal => ({
    ...(await importOriginal<object>()),
    initializeB24Frame: initFrame,
}));

import { BitrixBaseApi } from '../bitrix-base-api';
import type { IBXUser } from '../../../domain/interfaces/bitrix.interface';

const AUTH: AuthData = {
    access_token: 'frame-token',
    refresh_token: 'refresh-id',
    expires: 1_800_000_000,
    expires_in: 3600,
    domain: 'https://april.bitrix24.ru',
    member_id: 'member-1',
};

const FRAME_USER = { ID: 5, NAME: 'Из фрейма' } as IBXUser;
const FALLBACK_USER = { ID: 1, NAME: 'Запасной' } as IBXUser;

interface UserAnswer {
    isSuccess: boolean;
    getData: () => { result: IBXUser };
}

/** Отложенный ответ `user.current`: тест сам решает, когда Битрикс ответит */
const deferredUser = () => {
    let resolve!: (answer: UserAnswer) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<UserAnswer>((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return {
        promise,
        answer: () =>
            resolve({ isSuccess: true, getData: () => ({ result: FRAME_USER }) }),
        fail: () => reject(new Error('REST недоступен')),
    };
};

const enterFrame = (userCurrent: Promise<UserAnswer>) =>
    initFrame.mockResolvedValue({
        auth: { getAuthData: () => AUTH },
        actions: { v2: { call: { make: () => userCurrent } } },
    });

const createApi = () =>
    new BitrixBaseApi({ sendMessageAdminError: async () => {} });

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('BitrixBaseApi.init', () => {
    beforeEach(() => {
        initFrame.mockReset();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    it('по умолчанию ждёт пользователя — как раньше', async () => {
        const user = deferredUser();
        enterFrame(user.promise);
        const api = createApi();

        let started = false;
        const starting = api.init('fallback.ru', FALLBACK_USER).then(() => {
            started = true;
        });
        await flush();
        expect(started).toBe(false);

        user.answer();
        await starting;
        expect(api.getInitializedData()).toMatchObject({
            inFrame: true,
            initialized: true,
            domain: 'april.bitrix24.ru',
            user: FRAME_USER,
        });
    });

    it('deferUser: старт не ждёт user.current, домен уже известен', async () => {
        const user = deferredUser();
        enterFrame(user.promise);
        const api = createApi();

        await api.init('fallback.ru', FALLBACK_USER, { deferUser: true });
        expect(api.getInitializedData()).toMatchObject({
            inFrame: true,
            domain: 'april.bitrix24.ru',
        });

        let loaded: IBXUser | null | undefined;
        const waiting = api.whenUser().then(result => {
            loaded = result;
        });
        await flush();
        expect(loaded).toBeUndefined();

        user.answer();
        await waiting;
        expect(loaded).toEqual(FRAME_USER);
        expect(api.getUser()).toEqual(FRAME_USER);
    });

    it('deferUser: сбой user.current не роняет whenUser и не выводит из фрейма', async () => {
        const user = deferredUser();
        enterFrame(user.promise);
        const api = createApi();

        await api.init('fallback.ru', FALLBACK_USER, { deferUser: true });
        user.fail();

        await expect(api.whenUser()).resolves.toEqual(FALLBACK_USER);
        expect(api.getInitializedData().inFrame).toBe(true);
    });

    it('вне фрейма whenUser отвечает сразу запасным пользователем', async () => {
        initFrame.mockRejectedValue(new Error('не во фрейме'));
        const api = createApi();

        await api.init('fallback.ru', FALLBACK_USER, { deferUser: true });

        await expect(api.whenUser()).resolves.toEqual(FALLBACK_USER);
        expect(api.getInitializedData()).toMatchObject({
            inFrame: false,
            domain: 'fallback.ru',
        });
    });
});
