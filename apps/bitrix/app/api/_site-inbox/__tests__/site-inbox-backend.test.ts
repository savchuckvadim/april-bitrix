/**
 * Клиент приложения bot: ключ сайта в заголовке, пустые поля не уходят,
 * число частей брифа читается из ответа, любой сбой — «не доставлено».
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    SITE_BRIEF_PATH,
    SITE_INBOX_KEY_HEADER,
    sendSiteBrief,
    sendSiteLead,
    siteInboxUrl,
} from '../site-inbox-backend';

const fetchMock = vi.fn<typeof fetch>();

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

describe('sendSiteLead', () => {
    it('ключ сайта в заголовке, пустые поля не уходят', async () => {
        vi.stubEnv('SITE_LEAD_API_KEY', 'k-1');
        fetchMock.mockResolvedValueOnce(Response.json({ resultCode: 0, data: { delivered: true } }));

        await expect(
            sendSiteLead({ kind: 'offer', email: 'a@b.ru', name: '', company: undefined, page: '/home' }),
        ).resolves.toBe('sent');

        const [, init] = fetchMock.mock.calls[0] ?? [];
        expect(new Headers(init?.headers).get(SITE_INBOX_KEY_HEADER)).toBe('k-1');
        expect(JSON.parse(String(init?.body))).toEqual({ kind: 'offer', email: 'a@b.ru', page: '/home' });
    });

    it('отказ бэка конвертом с кодом 1 — «не доставлено»', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ resultCode: 1, message: 'x' }, { status: 200 }));
        await expect(sendSiteLead({ kind: 'demo', phone: '89001234567', page: '/platform' })).resolves.toBe('failed');
    });
});

describe('sendSiteLead: отказ в полях', () => {
    it('400 от бэка — «отклонено», а не «не доставлено»', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ resultCode: 1, message: 'Нужен телефон' }, { status: 400 }));
        await expect(sendSiteLead({ kind: 'offer', email: 'x@y.ru', page: '/home' })).resolves.toBe('rejected');
    });
});

describe('sendSiteBrief', () => {
    it('шлёт в ручку брифов и возвращает число частей', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ resultCode: 0, data: { delivered: true, parts: 4 } }));
        await expect(
            sendSiteBrief({ kind: 'calibration', protocol: 'текст', page: '/ai/briefs' }),
        ).resolves.toEqual({ status: 'sent', parts: 4 });
        expect(fetchMock.mock.calls[0]?.[0]).toBe(siteInboxUrl(SITE_BRIEF_PATH));
    });

    it('сбой сети и 429 — без частей', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
        await expect(sendSiteBrief({ kind: 'calibration', protocol: 'x' })).resolves.toEqual({ status: 'failed', parts: 0 });
        fetchMock.mockResolvedValueOnce(Response.json({ resultCode: 1 }, { status: 429 }));
        await expect(sendSiteBrief({ kind: 'calibration', protocol: 'x' })).resolves.toEqual({ status: 'throttled', parts: 0 });
    });
});
