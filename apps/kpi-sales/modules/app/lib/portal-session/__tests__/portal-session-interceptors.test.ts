/**
 * Интерцепторы `$api` пакета @workspace/nest-kpi-report-sales-api:
 * `Authorization: Bearer <portal-session token>` на каждом запросе и один
 * повтор запроса после 401 через зарегистрированное переоткрытие сессии.
 * Транспорт подменяем фейковым адаптером — сети нет.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    $api,
    customAxios,
    getPortalSessionToken,
    PORTAL_SESSION_OPEN_PATH,
    setPortalSessionRefresh,
    setPortalSessionToken,
} from '@workspace/nest-kpi-report-sales-api';

/** Типы адаптера берём из самого $api: axios в приложении не зависимость. */
type Adapter = Extract<
    NonNullable<typeof $api.defaults.adapter>,
    (...args: never[]) => unknown
>;
type AdapterConfig = Parameters<Adapter>[0];
type AdapterResponse = Awaited<ReturnType<Adapter>>;

type Status = 200 | 401 | 500;

const ok = (config: AdapterConfig, data: unknown): AdapterResponse => ({
    data: { resultCode: 0, data },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
});

/** Ошибка в форме AxiosError (isAxiosError + response.status), как её отдают адаптеры axios. */
const httpError = (config: AdapterConfig, status: Status): Error =>
    Object.assign(new Error(`Request failed with status code ${status}`), {
        isAxiosError: true,
        config,
        response: {
            data: { message: 'Нужен portal-context токен (Bearer)' },
            status,
            statusText: status === 401 ? 'Unauthorized' : 'Server Error',
            headers: {},
            config,
        },
    });

/** Фейковый адаптер: статус по номеру вызова (дальше сценария — 200) + журнал Authorization. */
const installAdapter = (scenario: Status[]) => {
    const authHeaders: Array<string | null> = [];
    let calls = 0;
    const adapter = vi.fn(
        async (config: AdapterConfig): Promise<AdapterResponse> => {
            const value = config.headers.get('Authorization');
            authHeaders.push(typeof value === 'string' ? value : null);
            const status = scenario[calls++] ?? 200;
            if (status !== 200) throw httpError(config, status);
            return ok(config, { echo: config.url });
        },
    );
    $api.defaults.adapter = adapter;
    return { adapter, authHeaders };
};

const request = (url = '/api/kpi-report/x') =>
    customAxios<{ echo: string }>({ url, method: 'POST', data: { a: 1 } });

describe('$api: portal-session интерцепторы', () => {
    const originalAdapter = $api.defaults.adapter;

    beforeEach(() => {
        setPortalSessionToken(null);
        setPortalSessionRefresh(null);
    });

    afterAll(() => {
        $api.defaults.adapter = originalAdapter;
    });

    it('с токеном каждый запрос уходит с Authorization: Bearer', async () => {
        setPortalSessionToken('jwt-1');
        const { authHeaders } = installAdapter([200]);
        await expect(request()).resolves.toEqual({ echo: '/api/kpi-report/x' });
        expect(authHeaders).toEqual(['Bearer jwt-1']);
    });

    it('без токена заголовка Authorization нет', async () => {
        const { authHeaders } = installAdapter([200]);
        await request();
        expect(authHeaders).toEqual([null]);
    });

    it('401 с refresh: ровно один повтор, уже с новым токеном', async () => {
        setPortalSessionToken('jwt-old');
        const refresh = vi.fn(async () => 'jwt-new');
        setPortalSessionRefresh(refresh);
        const { adapter, authHeaders } = installAdapter([401, 200]);

        await expect(request()).resolves.toEqual({ echo: '/api/kpi-report/x' });
        expect(adapter).toHaveBeenCalledTimes(2);
        expect(refresh).toHaveBeenCalledTimes(1);
        expect(authHeaders).toEqual(['Bearer jwt-old', 'Bearer jwt-new']);
        expect(getPortalSessionToken()).toBe('jwt-new');
    });

    it('401 без refresh: ошибка пробрасывается, повтора нет', async () => {
        setPortalSessionToken('jwt-old');
        const { adapter } = installAdapter([401]);
        await expect(request()).rejects.toThrow('401');
        expect(adapter).toHaveBeenCalledTimes(1);
        expect(getPortalSessionToken()).toBe('jwt-old');
    });

    it('второй 401 подряд не зацикливает: один refresh, один повтор, ошибка наружу', async () => {
        const refresh = vi.fn(async () => 'jwt-new');
        setPortalSessionRefresh(refresh);
        const { adapter } = installAdapter([401, 401, 401]);
        await expect(request()).rejects.toThrow('401');
        expect(adapter).toHaveBeenCalledTimes(2);
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('refresh не дал токена: исходный 401 наружу без повтора, токен не тронут', async () => {
        setPortalSessionToken('jwt-old');
        setPortalSessionRefresh(async () => null);
        const { adapter } = installAdapter([401]);
        await expect(request()).rejects.toThrow('401');
        expect(adapter).toHaveBeenCalledTimes(1);
        expect(getPortalSessionToken()).toBe('jwt-old');
    });

    it('refresh упал: исходный 401 наружу, без повтора', async () => {
        setPortalSessionRefresh(async () => {
            throw new Error('фрейм не ответил');
        });
        const { adapter } = installAdapter([401]);
        await expect(request()).rejects.toThrow('401');
        expect(adapter).toHaveBeenCalledTimes(1);
    });

    it('параллельные 401 → один общий refresh, каждый запрос повторён', async () => {
        const refresh = vi.fn(async () => 'jwt-new');
        setPortalSessionRefresh(refresh);
        const { adapter } = installAdapter([401, 401, 200, 200]);
        const results = await Promise.all([
            request('/api/a'),
            request('/api/b'),
        ]);
        expect(results).toEqual([{ echo: '/api/a' }, { echo: '/api/b' }]);
        expect(refresh).toHaveBeenCalledTimes(1);
        expect(adapter).toHaveBeenCalledTimes(4);
    });

    it('собственный 401 ручки обмена не повторяется и refresh не зовёт', async () => {
        const refresh = vi.fn(async () => 'jwt-new');
        setPortalSessionRefresh(refresh);
        const { adapter } = installAdapter([401]);
        await expect(request(PORTAL_SESSION_OPEN_PATH)).rejects.toThrow('401');
        expect(refresh).not.toHaveBeenCalled();
        expect(adapter).toHaveBeenCalledTimes(1);
    });

    it('не-401 ошибка уходит наружу как есть, refresh не зовёт', async () => {
        const refresh = vi.fn(async () => 'jwt-new');
        setPortalSessionRefresh(refresh);
        const { adapter } = installAdapter([500]);
        await expect(request()).rejects.toThrow('500');
        expect(refresh).not.toHaveBeenCalled();
        expect(adapter).toHaveBeenCalledTimes(1);
    });
});
