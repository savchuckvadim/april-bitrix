/**
 * Маршрут заявок /platform: единственное место, где заявка уходит со
 * страницы в бэк. Ошибка тут — потерянный клиент, поэтому проверяем каждую
 * ветку: ловушку, проверку полей, повторы и честные коды недоставки.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../route';
import {
    BOT_API_URL_DEFAULT,
    SITE_INBOX_KEY_HEADER,
    SITE_LEAD_PATH,
    siteInboxUrl,
} from '../../_site-inbox/site-inbox-backend';

const fetchMock = vi.fn<typeof fetch>();

const envelope = (status: number, resultCode: number): Response =>
    Response.json({ resultCode, data: { delivered: resultCode === 0 } }, { status });

/** Каждый тест со своим телефоном: память повторов маршрута общая на модуль. */
let phoneSeq = 1000;
const nextPhone = () => `+7 (900) 000-${String(phoneSeq++).padStart(4, '0')}`;

const lead = (overrides: Record<string, unknown> = {}) => ({
    name: 'Ирина',
    phone: nextPhone(),
    company: '',
    comment: 'Хочу посмотреть AI',
    consent: true,
    page: '/platform/ai',
    website: '',
    ...overrides,
});

/** Каждый запрос со своего адреса, если тест не задал общий: лимит на посетителя живёт в модуле. */
let ipSeq = 1;
const post = (body: unknown, ip = `10.0.0.${ipSeq++}`): Promise<Response> =>
    POST(
        new Request('http://localhost/api/platform-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-real-ip': ip },
            body: typeof body === 'string' ? body : JSON.stringify(body),
        }),
    );

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe('POST /api/platform-lead', () => {
    it('заполненная ловушка — «ок» без отправки', async () => {
        const response = await post(lead({ website: 'https://spam.example' }));
        expect(response.status).toBe(200);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('не JSON и кривые поля — 400 без отправки', async () => {
        expect((await post('не json')).status).toBe(400);
        const invalid = await post(lead({ phone: '123', consent: false }));
        expect(invalid.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('шлёт в бот заявку без пустых полей, с ключом сайта, и отвечает «ок» по ответу бэка', async () => {
        vi.stubEnv('SITE_LEAD_API_KEY', 'site-key-123');
        fetchMock.mockResolvedValueOnce(envelope(200, 0));
        const body = lead();
        const response = await post(body);

        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0] ?? [];
        expect(url).toBe(`${BOT_API_URL_DEFAULT}${SITE_LEAD_PATH}`);
        expect(new Headers(init?.headers).get(SITE_INBOX_KEY_HEADER)).toBe('site-key-123');
        expect(JSON.parse(String(init?.body))).toEqual({
            kind: 'demo',
            name: 'Ирина',
            phone: body.phone,
            comment: 'Хочу посмотреть AI',
            page: '/platform/ai',
        });
    });

    it('повтор той же заявки не уходит второй раз', async () => {
        fetchMock.mockImplementation(async () => envelope(200, 0));
        const body = lead();
        expect((await post(body)).status).toBe(200);
        expect((await post({ ...body, page: '/platform' })).status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('бэк не доставил (503) — 502, и повтор после сбоя уходит снова', async () => {
        fetchMock.mockResolvedValueOnce(envelope(503, 1));
        const body = lead();
        expect((await post(body)).status).toBe(502);

        fetchMock.mockResolvedValueOnce(envelope(200, 0));
        expect((await post(body)).status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('с одного адреса — не больше трёх отправок за 10 минут, другой адрес не страдает', async () => {
        // Тело ответа читается один раз — на каждый вызов свой Response.
        fetchMock.mockImplementation(async () => envelope(200, 0));
        const ip = '203.0.113.7';
        for (let i = 0; i < 3; i += 1) {
            expect((await post(lead(), ip)).status).toBe(200);
        }
        expect((await post(lead(), ip)).status).toBe(429);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect((await post(lead(), '203.0.113.8')).status).toBe(200);
    });

    it('потолок заявок в бэке — 429', async () => {
        fetchMock.mockResolvedValueOnce(envelope(429, 1));
        expect((await post(lead())).status).toBe(429);
    });

    it('сеть упала или ответ не конверт — 502', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
        expect((await post(lead())).status).toBe(502);

        fetchMock.mockResolvedValueOnce(new Response('<html>шлюз</html>', { status: 200 }));
        expect((await post(lead())).status).toBe(502);
    });
});

describe('siteInboxUrl', () => {
    it('без окружения — прод-дефолт', () => {
        vi.stubEnv('BOT_API_URL', '');
        expect(siteInboxUrl(SITE_LEAD_PATH)).toBe('https://api.bot.april-app.ru/api/site-lead');
    });

    it('база из окружения — со слешем и без', () => {
        vi.stubEnv('BOT_API_URL', 'http://localhost:3010');
        expect(siteInboxUrl(SITE_LEAD_PATH)).toBe('http://localhost:3010/api/site-lead');
        vi.stubEnv('BOT_API_URL', 'http://localhost:3010/');
        expect(siteInboxUrl(SITE_LEAD_PATH)).toBe('http://localhost:3010/api/site-lead');
    });
});
