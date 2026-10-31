import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getCatalog } from '@/app/api/public/[token]/catalog/route';
import { POST as postDescription } from '@/app/api/public/[token]/description/route';
import { GET as getMeta } from '@/app/api/public/[token]/route';

const params = Promise.resolve({ token: 'tok' });
const getRequest = new NextRequest('http://localhost/api/public/tok');
const postRequest = (body: string) =>
    new NextRequest('http://localhost/api/public/tok/description', {
        method: 'POST',
        body,
    });

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

    it('описание: тело уходит как есть, файл и его имя возвращаются потоком', async () => {
        backend.mockResolvedValue(
            new Response('docx-bytes', {
                headers: {
                    'Content-Type': 'application/docx',
                    'Content-Disposition': "attachment; filename*=UTF-8''a.docx",
                },
            }),
        );

        const response = await postDescription(postRequest('{"groups":[]}'), {
            params,
        });

        expect(backend.mock.calls[0]?.[1]).toMatchObject({
            method: 'POST',
            body: '{"groups":[]}',
        });
        expect(await response.text()).toBe('docx-bytes');
        expect(response.headers.get('Content-Disposition')).toContain('a.docx');
        expect(response.headers.get('X-Robots-Tag')).toBe(NOINDEX);
    });

    it('описание: лимит бэка доходит как 429', async () => {
        backend.mockResolvedValue(new Response('{}', { status: 429 }));

        const response = await postDescription(postRequest('{}'), { params });

        expect(response.status).toBe(429);
    });

    it('описание: чрезмерный запрос режется, не доходя до бэка', async () => {
        const response = await postDescription(
            postRequest('x'.repeat(5_000_001)),
            { params },
        );

        expect(response.status).toBe(413);
        expect(backend).not.toHaveBeenCalled();
    });
});
