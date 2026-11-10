/**
 * bootstrapPortalSession: вне фрейма ничего не зовёт; во фрейме обменивает
 * auth-данные фрейма на токен, кладёт его в транспорт api-пакета и
 * регистрирует переоткрытие сессии (повторный обмен свежими данными).
 */
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
    type Mock,
} from 'vitest';
import type { BxFrameAuth } from '@workspace/bitrix';
import {
    getPortalSessionToken,
    setPortalSessionRefresh,
    setPortalSessionToken,
    type PortalSessionRefresh,
} from '@workspace/nest-konstructor-api';
import type {
    PortalSession,
    PortalSessionOpenInput,
} from '../api/portal-session-helper';
import { bootstrapPortalSession } from '../portal-session';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { open, registerRefresh } = vi.hoisted(() => ({
    open: vi.fn<(input: PortalSessionOpenInput) => Promise<PortalSession>>(),
    registerRefresh: vi.fn<(refresh: PortalSessionRefresh | null) => void>(),
}));

vi.mock('../api/portal-session-helper', () => ({
    PortalSessionHelper: class {
        open = open;
    },
}));

vi.mock('@workspace/nest-konstructor-api', async importOriginal => {
    const actual =
        await importOriginal<typeof import('@workspace/nest-konstructor-api')>();
    return {
        ...actual,
        // регистрацию перехватываем, чтобы дёрнуть refresh руками; реальную оставляем
        setPortalSessionRefresh: (refresh: PortalSessionRefresh | null) => {
            registerRefresh(refresh);
            actual.setPortalSessionRefresh(refresh);
        },
    };
});

const AUTH: BxFrameAuth = {
    accessToken: 'frame-token',
    domain: 'april-garant.bitrix24.ru',
    memberId: 'member-1',
    expiresIn: 3600,
};

const SESSION: PortalSession = {
    token: 'jwt-1',
    expiresAt: '2026-11-11T02:00:00.000Z',
    domain: 'april-garant.bitrix24.ru',
};

interface FrameApiMock {
    getFrameAuth: Mock<() => BxFrameAuth | null>;
    refreshFrameAuth: Mock<() => Promise<BxFrameAuth | null>>;
}

const frameApi = (
    auth: BxFrameAuth | null,
    refreshed: BxFrameAuth | null = null,
): FrameApiMock => ({
    getFrameAuth: vi.fn(() => auth),
    refreshFrameAuth: vi.fn(async () => refreshed),
});

/** Зарегистрированное bootstrap'ом переоткрытие сессии. */
const registeredRefresh = (): PortalSessionRefresh => {
    const refresh = registerRefresh.mock.calls.at(-1)?.[0];
    if (!refresh) throw new Error('переоткрытие сессии не зарегистрировано');
    return refresh;
};

describe('bootstrapPortalSession', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        setPortalSessionToken(null);
        setPortalSessionRefresh(null);
        open.mockReset();
        registerRefresh.mockClear();
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it('вне фрейма: обмена нет, токена нет, refresh не регистрируется', async () => {
        await expect(bootstrapPortalSession(frameApi(null))).resolves.toBe(false);
        expect(open).not.toHaveBeenCalled();
        expect(registerRefresh).not.toHaveBeenCalled();
        expect(getPortalSessionToken()).toBeNull();
    });

    it('во фрейме: обмен с {domain, accessToken, memberId}, токен в транспорте', async () => {
        open.mockResolvedValue(SESSION);
        await expect(bootstrapPortalSession(frameApi(AUTH))).resolves.toBe(true);
        expect(open).toHaveBeenCalledWith({
            domain: 'april-garant.bitrix24.ru',
            accessToken: 'frame-token',
            memberId: 'member-1',
        });
        expect(getPortalSessionToken()).toBe('jwt-1');
        expect(warn).not.toHaveBeenCalled();
    });

    it('ошибка обмена: false, токена нет, предупреждение в консоль', async () => {
        open.mockRejectedValue(new Error('Битрикс24 не подтвердил токен фрейма'));
        await expect(bootstrapPortalSession(frameApi(AUTH))).resolves.toBe(false);
        expect(getPortalSessionToken()).toBeNull();
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('Битрикс24 не подтвердил токен фрейма'),
        );
    });

    it('переоткрытие: протухший токен фрейма обновляется через refreshFrameAuth', async () => {
        const api = frameApi(AUTH, { ...AUTH, accessToken: 'fresh-token' });
        open.mockResolvedValueOnce(SESSION);
        await bootstrapPortalSession(api);

        api.getFrameAuth.mockReturnValue(null);
        open.mockResolvedValueOnce({ ...SESSION, token: 'jwt-2' });

        await expect(registeredRefresh()()).resolves.toBe('jwt-2');
        expect(api.refreshFrameAuth).toHaveBeenCalledTimes(1);
        expect(open).toHaveBeenLastCalledWith(
            expect.objectContaining({ accessToken: 'fresh-token' }),
        );
    });

    it('переоткрытие: ошибка обмена → null, старый токен остаётся', async () => {
        const api = frameApi(AUTH);
        open.mockResolvedValueOnce(SESSION);
        await bootstrapPortalSession(api);

        open.mockRejectedValueOnce(new Error('сеть упала'));
        await expect(registeredRefresh()()).resolves.toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('сеть упала'));
        expect(getPortalSessionToken()).toBe('jwt-1');
    });
});
