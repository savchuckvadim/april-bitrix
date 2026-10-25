import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BxFrameAuth } from '@workspace/bitrix';

const h = vi.hoisted(() => ({
    customAxios: vi.fn(),
    token: null as string | null,
    refresh: null as (() => Promise<string | null>) | null,
    report: vi.fn(),
}));

vi.mock('@workspace/nest-event-sales-api', () => ({
    PORTAL_SESSION_OPEN_PATH: '/api/auth/portal-session',
    customAxios: h.customAxios,
    getPortalSessionToken: () => h.token,
    setPortalSessionToken: (token: string | null) => {
        h.token = token;
    },
    setPortalSessionRefresh: (refresh: () => Promise<string | null>) => {
        h.refresh = refresh;
    },
}));

vi.mock('@/modules/shared/front-error/report-front-error', () => ({
    reportFrontError: h.report,
}));

import { connectBitrixServerMode } from './connect-server-mode';
import {
    FRAME_PROXY_BATCH_URL,
    FRAME_PROXY_CALL_URL,
    FrameProxyError,
    createFrameProxyTransport,
} from './frame-proxy-transport';
import { createPortalSessionOpener } from './portal-session';

const AUTH: BxFrameAuth = {
    accessToken: 'frame-token',
    domain: 'garant.bitrix24.ru',
    memberId: 'm1',
    expiresIn: 3600,
};

const IDENTITY = { domain: 'garant.bitrix24.ru', requesterUserId: '459' };

/** Хранилище вкладки: тесты идут без браузера (как metrics-client.test). */
const createSessionStorage = () => {
    const bag = new Map<string, string>();
    return {
        getItem: (key: string) => bag.get(key) ?? null,
        setItem: (key: string, value: string) => {
            bag.set(key, value);
        },
    };
};

beforeEach(() => {
    h.customAxios.mockReset();
    h.report.mockReset();
    h.token = null;
    h.refresh = null;
    vi.stubGlobal('window', { sessionStorage: createSessionStorage() });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('транспорт через сервер', () => {
    it('вызов: тело с доменом и пользователем, ответ Битрикса как есть', async () => {
        h.customAxios.mockResolvedValue({ ok: true, answer: { result: 5 } });
        const transport = createFrameProxyTransport(IDENTITY, async () => {});

        await expect(
            transport.call('crm.company.update', { id: 1 }),
        ).resolves.toEqual({ result: 5 });
        expect(h.customAxios).toHaveBeenCalledWith({
            url: FRAME_PROXY_CALL_URL,
            method: 'POST',
            data: { ...IDENTITY, method: 'crm.company.update', params: { id: 1 } },
        });
    });

    it('ошибка Битрикса на сервере — исключение с кодом', async () => {
        h.customAxios.mockResolvedValue({
            ok: false,
            error: 'NOT_FOUND',
            errorDescription: 'Not found',
        });
        const transport = createFrameProxyTransport(IDENTITY, async () => {});
        const failure = await transport
            .call('crm.deal.get', { id: 1 })
            .catch((error: unknown) => error);
        expect(failure).toBeInstanceOf(FrameProxyError);
        expect((failure as FrameProxyError).code).toBe('NOT_FOUND');
    });

    it('пакет — на ручку batch, после открытия сессии', async () => {
        const order: string[] = [];
        h.customAxios.mockImplementation(async () => {
            order.push('batch');
            return { result: { a: 1 }, errors: {} };
        });
        const transport = createFrameProxyTransport(IDENTITY, async () => {
            order.push('session');
        });
        const commands = { a: { method: 'crm.deal.get', params: { id: 1 } } };

        await expect(transport.batch(commands)).resolves.toEqual({
            result: { a: 1 },
            errors: {},
        });
        expect(order).toEqual(['session', 'batch']);
        expect(h.customAxios).toHaveBeenCalledWith({
            url: FRAME_PROXY_BATCH_URL,
            method: 'POST',
            data: { ...IDENTITY, commands },
        });
    });
});

describe('сессия на сервере', () => {
    it('открывается один раз на одновременные запросы и регистрирует переоткрытие', async () => {
        h.customAxios.mockResolvedValue({ token: 'jwt-1' });
        const ensure = createPortalSessionOpener({
            getFrameAuth: () => AUTH,
        });

        await Promise.all([ensure(), ensure()]);
        await ensure();

        expect(h.customAxios).toHaveBeenCalledTimes(1);
        expect(h.customAxios).toHaveBeenCalledWith({
            url: '/api/auth/portal-session',
            method: 'POST',
            data: {
                domain: 'garant.bitrix24.ru',
                accessToken: 'frame-token',
                memberId: 'm1',
            },
        });
        expect(h.token).toBe('jwt-1');
        expect(h.refresh).not.toBeNull();
    });

    it('нет данных входа фрейма — понятная ошибка', async () => {
        const ensure = createPortalSessionOpener({ getFrameAuth: () => null });
        await expect(ensure()).rejects.toThrow('Нет данных входа');
    });
});

describe('connectBitrixServerMode', () => {
    const makeApi = () => {
        const serverMode = {
            connect: vi.fn(),
            activate: vi.fn(),
        };
        return {
            api: { serverMode, getFrameAuth: () => AUTH } as never,
            serverMode,
        };
    };

    it('переключение запоминается во вкладке и пишется в журнал фронта', () => {
        const { api, serverMode } = makeApi();
        connectBitrixServerMode(api, { domain: 'garant.bitrix24.ru', userId: '459' });

        const listener = serverMode.connect.mock.calls[0]?.[1] as (event: {
            method: string;
            reason: string;
        }) => void;
        vi.spyOn(console, 'info').mockImplementation(() => {});
        listener({ method: 'crm.company.update', reason: 'ACCESS_DENIED' });

        expect(h.report).toHaveBeenCalledWith(
            expect.objectContaining({
                place: 'bitrix.server-mode',
                domain: 'garant.bitrix24.ru',
                userId: '459',
            }),
        );

        // Новое открытие вкладки: режим включается сразу, без отказа.
        const next = makeApi();
        connectBitrixServerMode(next.api, {
            domain: 'garant.bitrix24.ru',
            userId: '459',
        });
        expect(next.serverMode.activate).toHaveBeenCalledTimes(1);
    });

    it('без домена или пользователя — не подключаем', () => {
        const { api, serverMode } = makeApi();
        connectBitrixServerMode(api, { domain: '', userId: '459' });
        expect(serverMode.connect).not.toHaveBeenCalled();
    });
});
