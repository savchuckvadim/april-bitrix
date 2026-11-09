/**
 * Файлы картинок и видео с адреса сайта: проксирование на бэк. Ошибка
 * здесь — видео не перематывается (Range потерян), посторонний путь уходит
 * на бэк или браузер получает чужие заголовки.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../route';

const FILE = 'hub-overview.aaaaaaaaaaaa.mp4';

const fetchMock = vi.fn<typeof fetch>();

const get = (section: string, file: string, headers: Record<string, string> = {}) =>
    GET(new Request(`http://localhost/media/${section}/${file}`, { headers }), {
        params: Promise.resolve({ section, file }),
    });

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('GET /media/<раздел>/<файл>', () => {
    it('кусок видео: Range уходит на бэк, 206 и заголовки куска — посетителю', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response('0123456789', {
                status: 206,
                headers: {
                    'content-type': 'video/mp4',
                    'content-range': 'bytes 0-9/64',
                    'accept-ranges': 'bytes',
                    'cache-control': 'public, max-age=31536000, immutable',
                    'set-cookie': 'secret=1',
                },
            }),
        );

        const response = await get('platform', FILE, { range: 'bytes=0-9', cookie: 'session=1' });

        expect(response.status).toBe(206);
        expect(response.headers.get('content-range')).toBe('bytes 0-9/64');
        expect(response.headers.get('cache-control')).toContain('immutable');
        expect(response.headers.get('set-cookie')).toBeNull();
        expect(await response.text()).toBe('0123456789');

        const [url, init] = fetchMock.mock.calls[0] ?? [];
        expect(url).toBe(`https://api.bot.april-app.ru/api/site-media/platform/files/${FILE}`);
        const sent = new Headers(init?.headers);
        expect(sent.get('range')).toBe('bytes=0-9');
        expect(sent.get('cookie')).toBeNull();
    });

    it('чужой раздел или имя файла — 404 без запроса на бэк', async () => {
        for (const [section, file] of [
            ['platform', '..%2F..%2Fsecret.txt'],
            ['platform', 'calls-form.png'],
            ['Platform', FILE],
            ['..', FILE],
        ] as const) {
            expect((await get(section, file)).status, `${section}/${file}`).toBe(404);
        }
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('файл заменили или удалили — 404; «не изменился» — 304 без тела', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
        expect((await get('platform', FILE)).status).toBe(404);

        fetchMock.mockResolvedValueOnce(new Response(null, { status: 304, headers: { etag: 'W/"1"' } }));
        const notModified = await get('platform', FILE, { 'if-none-match': 'W/"1"' });
        expect(notModified.status).toBe(304);
        expect(notModified.body).toBeNull();
    });

    it('бэк лежит или ответил ошибкой — 502', async () => {
        fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
        expect((await get('platform', FILE)).status).toBe(502);
        fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));
        expect((await get('platform', FILE)).status).toBe(502);
    });

    it('сжатое тело — без прежней длины, иначе браузер оборвёт файл', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response('x', {
                status: 200,
                headers: { 'content-type': 'image/png', 'content-length': '999', 'content-encoding': 'gzip' },
            }),
        );
        const response = await get('platform', 'calls-form.0123456789ab.png');
        expect(response.headers.get('content-length')).toBeNull();
    });
});
