import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pbxRequest, SessionExpiredError } from '../../marketplace/pbx-api.client';
import { siteAuthSource, siteSession } from '../site-session.store';
import { listCabinetPortals } from '../cabinet.api';

/** Ответ api.pbx в конверте `{ resultCode, data }`. */
const ok = (data: unknown, status = 200) =>
    new Response(JSON.stringify({ resultCode: 0, data }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const fail = (status: number, message: string) =>
    new Response(JSON.stringify({ message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const SESSION = {
    accessToken: 'site-access',
    accessExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    userId: 17,
};

describe('кабинет на сайте: сессия и источник токена', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(async () => {
        fetchMock.mockResolvedValue(ok({ ok: true }));
        await siteSession.logout();
        vi.unstubAllGlobals();
    });

    it('вход: ручка login с cookies, без Bearer; сессия ready', async () => {
        fetchMock.mockResolvedValueOnce(ok(SESSION));

        await siteSession.login('anna@company.ru', 'Пароль2026');

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toMatch(/\/api\/cabinet\/auth\/login$/);
        expect(init.credentials).toBe('include');
        expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
        expect(siteSession.getSnapshot()).toEqual({ status: 'ready', userId: 17 });
        expect(siteSession.getToken()).toBe('site-access');
    });

    it('неверный пароль: ошибка наверх, сессии нет', async () => {
        fetchMock.mockResolvedValueOnce(fail(401, 'Неверный email или пароль'));

        await expect(siteSession.login('a@b.ru', 'x')).rejects.toThrow(
            'Неверный email или пароль',
        );
        expect(siteSession.getSnapshot().status).toBe('anonymous');
    });

    it('после входа запросы кабинета идут с Bearer сайта', async () => {
        fetchMock.mockResolvedValueOnce(ok(SESSION)).mockResolvedValueOnce(ok([]));
        await siteSession.login('anna@company.ru', 'Пароль2026');

        await listCabinetPortals();

        const [, init] = fetchMock.mock.calls[1] as [string, RequestInit];
        expect((init.headers as Record<string, string>).Authorization).toBe(
            'Bearer site-access',
        );
    });

    it('страница открыта заново: токен восстанавливается по refresh-cookie', async () => {
        // «Новая страница» — чистое состояние модуля (оно живёт на globalThis)
        const holder = globalThis as Record<string, unknown>;
        const saved = holder.__cabinetSiteSession__;
        delete holder.__cabinetSiteSession__;
        vi.resetModules();
        const fresh = await import('../site-session.store');
        fetchMock.mockResolvedValueOnce(ok(SESSION));

        await expect(fresh.siteAuthSource.getToken()).resolves.toBe('site-access');

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toMatch(/\/api\/cabinet\/auth\/refresh$/);
        expect(init.credentials).toBe('include');
        holder.__cabinetSiteSession__ = saved;
    });

    it('после выхода токен молча не восстанавливается', async () => {
        await expect(siteAuthSource.getToken()).resolves.toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('401 на запрос сайта: сессия сброшена, текст «войдите заново»', async () => {
        fetchMock.mockResolvedValueOnce(ok(SESSION)).mockResolvedValueOnce(fail(401, 'x'));
        await siteSession.login('anna@company.ru', 'Пароль2026');

        const error = await pbxRequest({
            method: 'GET',
            path: '/api/cabinet/me',
            authSource: siteAuthSource,
        }).catch((failure: unknown) => failure);

        expect(error).toBeInstanceOf(SessionExpiredError);
        expect((error as Error).message).toBe('Сессия истекла — войдите заново');
        expect(siteSession.getSnapshot().status).toBe('anonymous');
    });

    it('DELETE не повторяется при сетевой ошибке', async () => {
        fetchMock.mockResolvedValueOnce(ok(SESSION)).mockRejectedValue(new Error('net'));
        await siteSession.login('anna@company.ru', 'Пароль2026');

        await expect(
            pbxRequest({ method: 'DELETE', path: '/api/cabinet/x', authSource: siteAuthSource }),
        ).rejects.toThrow('net');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
