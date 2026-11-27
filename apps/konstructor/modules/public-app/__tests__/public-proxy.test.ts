import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getCatalog } from '@/app/api/public/[token]/catalog/route';
import { GET as getMeta } from '@/app/api/public/[token]/route';

const params = Promise.resolve({ token: 'tok' });
const getRequest = new NextRequest('http://localhost/api/public/tok');

const NOINDEX = 'noindex, nofollow';

describe('Next-прокси публичной ссылки', () => {
    let backend: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.stubEnv('KONSTRUCTOR_API_URL', 'http://back.test/');
        backend = vi.fn();
        vi.stubGlobal('fetch', backend);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it('разворачивает конверт Nest и не даёт индексировать', async () => {
        backend.mockResolvedValue(
            new Response(
                JSON.stringify({ resultCode: 0, data: { expiresAt: null } }),
            ),
        );

        const response = await getMeta(getRequest, { params });

        expect(backend.mock.calls[0]?.[0]).toBe(
            'http://back.test/api/konstructor/public/tok',
        );
        expect(await response.json()).toEqual({ expiresAt: null });
        expect(response.headers.get('X-Robots-Tag')).toBe(NOINDEX);
    });

    it('каталог идёт на свою ручку бэка', async () => {
        backend.mockResolvedValue(
            new Response(JSON.stringify({ resultCode: 0, data: {} })),
        );

        await getCatalog(getRequest, { params });

        expect(backend.mock.calls[0]?.[0]).toBe(
            'http://back.test/api/konstructor/public/tok/catalog',
        );
    });

    it('410 бэка доходит до страницы как 410', async () => {
        backend.mockResolvedValue(new Response('{}', { status: 410 }));

        const response = await getCatalog(getRequest, { params });

        expect(response.status).toBe(410);
    });

    it('бэк недоступен — 502: страница покажет экран повтора', async () => {
        const silent = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        backend.mockRejectedValue(new Error('down'));

        const response = await getMeta(getRequest, { params });

        expect(response.status).toBe(502);
        silent.mockRestore();
    });
});
