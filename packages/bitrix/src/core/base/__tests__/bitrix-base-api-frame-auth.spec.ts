/**
 * `BitrixBaseApi.getFrameAuth()` / `refreshFrameAuth()`: auth-данные фрейма
 * для portal-context сессии бэка. Вне фрейма — null; во фрейме — данные из
 * `bx.auth.getAuthData()`, а протухший токен (`false`) обновляется через
 * `bx.auth.refreshAuth()`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthData } from '@bitrix24/b24jssdk';
import { BitrixBaseApi } from '../bitrix-base-api';

const AUTH: AuthData = {
    access_token: 'frame-token',
    refresh_token: 'refresh-id',
    expires: 1_800_000_000,
    expires_in: 3600,
    domain: 'https://april.bitrix24.ru',
    member_id: 'member-1',
};

/** Фрейм SDK — только то, что читает getFrameAuth/refreshFrameAuth. */
interface FakeFrame {
    auth: {
        getAuthData: () => false | AuthData;
        refreshAuth: () => Promise<AuthData>;
    };
}

/** Приватные поля api, которые выставляет init(): фрейм и признак inFrame. */
interface FrameState {
    bx: FakeFrame;
    inFrame: boolean;
}

const createApi = () =>
    new BitrixBaseApi({ sendMessageAdminError: async () => {} });

const enterFrame = (api: BitrixBaseApi, frame: FakeFrame) => {
    const state = api as unknown as FrameState;
    state.bx = frame;
    state.inFrame = true;
};

describe('BitrixBaseApi.getFrameAuth', () => {
    let api: BitrixBaseApi;

    beforeEach(() => {
        api = createApi();
    });

    it('вне фрейма → null (SDK не трогаем)', () => {
        expect(api.getFrameAuth()).toBeNull();
    });

    it('во фрейме → access_token, хост портала, member_id, expires_in', () => {
        enterFrame(api, {
            auth: {
                getAuthData: () => AUTH,
                refreshAuth: async () => AUTH,
            },
        });
        expect(api.getFrameAuth()).toEqual({
            accessToken: 'frame-token',
            domain: 'april.bitrix24.ru',
            memberId: 'member-1',
            expiresIn: 3600,
        });
    });

    it('во фрейме с протухшим токеном (getAuthData → false) → null', () => {
        enterFrame(api, {
            auth: {
                getAuthData: () => false,
                refreshAuth: async () => AUTH,
            },
        });
        expect(api.getFrameAuth()).toBeNull();
    });
});

describe('BitrixBaseApi.refreshFrameAuth', () => {
    let api: BitrixBaseApi;

    beforeEach(() => {
        api = createApi();
    });

    it('вне фрейма → null без обращения к SDK', async () => {
        await expect(api.refreshFrameAuth()).resolves.toBeNull();
    });

    it('во фрейме → свежие auth-данные из bx.auth.refreshAuth()', async () => {
        const refreshAuth = vi.fn(async () => ({
            ...AUTH,
            access_token: 'fresh-token',
        }));
        enterFrame(api, { auth: { getAuthData: () => false, refreshAuth } });
        await expect(api.refreshFrameAuth()).resolves.toMatchObject({
            accessToken: 'fresh-token',
            domain: 'april.bitrix24.ru',
        });
        expect(refreshAuth).toHaveBeenCalledTimes(1);
    });

    it('отказ родительского окна → null и предупреждение в консоль', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        enterFrame(api, {
            auth: {
                getAuthData: () => false,
                refreshAuth: async () => {
                    throw new Error('parent window is gone');
                },
            },
        });
        await expect(api.refreshFrameAuth()).resolves.toBeNull();
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('refreshFrameAuth'),
        );
        warn.mockRestore();
    });
});
