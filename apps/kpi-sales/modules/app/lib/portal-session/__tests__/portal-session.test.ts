/**
 * bootstrapPortalSession: вне фрейма ничего не зовёт; во фрейме обменивает
 * auth-данные фрейма на JWT, кладёт его в транспорт api-пакета и
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
    type PortalSessionDto,
    type PortalSessionOpenDto,
    type PortalSessionRefresh,
} from '@workspace/nest-kpi-report-sales-api';
import { bootstrapPortalSession } from '../portal-session';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { portalSessionOpen, registerRefresh } = vi.hoisted(() => ({
    portalSessionOpen:
        vi.fn<(input: PortalSessionOpenDto) => Promise<PortalSessionDto>>(),
    registerRefresh: vi.fn<(refresh: PortalSessionRefresh | null) => void>(),
}));

vi.mock('@workspace/nest-kpi-report-sales-api', async importOriginal => {
    const actual =
        await importOriginal<
            typeof import('@workspace/nest-kpi-report-sales-api')
        >();
    return {
        ...actual,
        getPortalSession: () => ({ portalSessionOpen }),
        // регистрацию перехватываем, чтобы дёрнуть refresh руками; реальную оставляем
        setPortalSessionRefresh: (refresh: PortalSessionRefresh | null) => {
            registerRefresh(refresh);
            actual.setPortalSessionRefresh(refresh);
        },
    };
});

const AUTH: BxFrameAuth = {
    accessToken: 'frame-token',
    domain: 'april.bitrix24.ru',
    memberId: 'member-1',
    expiresIn: 3600,
};

const SESSION: PortalSessionDto = {
    token: 'jwt-1',
    expiresAt: '2026-09-22T02:00:00.000Z',
    domain: 'april.bitrix24.ru',
    user: { id: '447', name: 'Иван', lastName: 'Петров', isAdmin: false },
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
        portalSessionOpen.mockReset();
        registerRefresh.mockClear();
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it('вне фрейма: обмен не зовётся, токен не ставится, refresh не регистрируется', async () => {
        await expect(bootstrapPortalSession(frameApi(null))).resolves.toBe(
            false,
        );
        expect(portalSessionOpen).not.toHaveBeenCalled();
        expect(registerRefresh).not.toHaveBeenCalled();
        expect(getPortalSessionToken()).toBeNull();
    });

    it('во фрейме: обмен с {domain, accessToken, memberId}, токен в транспорте', async () => {
        portalSessionOpen.mockResolvedValue(SESSION);
        await expect(bootstrapPortalSession(frameApi(AUTH))).resolves.toBe(
            true,
        );
        expect(portalSessionOpen).toHaveBeenCalledTimes(1);
        expect(portalSessionOpen).toHaveBeenCalledWith({
            domain: 'april.bitrix24.ru',
            accessToken: 'frame-token',
            memberId: 'member-1',
        });
        expect(getPortalSessionToken()).toBe('jwt-1');
        expect(warn).not.toHaveBeenCalled();
    });

    it('без member_id обмен идёт без memberId', async () => {
        portalSessionOpen.mockResolvedValue(SESSION);
        await bootstrapPortalSession(frameApi({ ...AUTH, memberId: null }));
        const input = portalSessionOpen.mock.calls[0]?.[0];
        expect(input).toMatchObject({
            domain: 'april.bitrix24.ru',
            accessToken: 'frame-token',
        });
        expect(input?.memberId).toBeUndefined();
    });

    it('ошибка обмена: false, токен не установлен, предупреждение в консоль', async () => {
        portalSessionOpen.mockRejectedValue(
            new Error('Битрикс24 не подтвердил токен фрейма'),
        );
        await expect(bootstrapPortalSession(frameApi(AUTH))).resolves.toBe(
            false,
        );
        expect(getPortalSessionToken()).toBeNull();
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('Битрикс24 не подтвердил токен фрейма'),
        );
    });

    it('переоткрытие: берёт auth-данные фрейма заново и отдаёт новый токен', async () => {
        const api = frameApi(AUTH);
        portalSessionOpen.mockResolvedValueOnce(SESSION);
        await bootstrapPortalSession(api);

        api.getFrameAuth.mockReturnValue({
            ...AUTH,
            accessToken: 'frame-token-2',
        });
        portalSessionOpen.mockResolvedValueOnce({ ...SESSION, token: 'jwt-2' });

        await expect(registeredRefresh()()).resolves.toBe('jwt-2');
        expect(portalSessionOpen).toHaveBeenLastCalledWith({
            domain: 'april.bitrix24.ru',
            accessToken: 'frame-token-2',
            memberId: 'member-1',
        });
        expect(api.refreshFrameAuth).not.toHaveBeenCalled();
    });

    it('переоткрытие: протухший токен фрейма обновляется через refreshFrameAuth', async () => {
        const api = frameApi(AUTH, { ...AUTH, accessToken: 'fresh-token' });
        portalSessionOpen.mockResolvedValueOnce(SESSION);
        await bootstrapPortalSession(api);

        api.getFrameAuth.mockReturnValue(null);
        portalSessionOpen.mockResolvedValueOnce({ ...SESSION, token: 'jwt-3' });

        await expect(registeredRefresh()()).resolves.toBe('jwt-3');
        expect(api.refreshFrameAuth).toHaveBeenCalledTimes(1);
        expect(portalSessionOpen).toHaveBeenLastCalledWith(
            expect.objectContaining({ accessToken: 'fresh-token' }),
        );
    });

    it('переоткрытие: нет auth-данных фрейма → null без обмена', async () => {
        const api = frameApi(AUTH);
        portalSessionOpen.mockResolvedValueOnce(SESSION);
        await bootstrapPortalSession(api);

        api.getFrameAuth.mockReturnValue(null);
        await expect(registeredRefresh()()).resolves.toBeNull();
        expect(portalSessionOpen).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('нет auth-данных фрейма'),
        );
    });

    it('переоткрытие: ошибка обмена → null и предупреждение', async () => {
        const api = frameApi(AUTH);
        portalSessionOpen.mockResolvedValueOnce(SESSION);
        await bootstrapPortalSession(api);

        portalSessionOpen.mockRejectedValueOnce(new Error('сеть упала'));
        await expect(registeredRefresh()()).resolves.toBeNull();
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('сеть упала'),
        );
        expect(getPortalSessionToken()).toBe('jwt-1');
    });
});
