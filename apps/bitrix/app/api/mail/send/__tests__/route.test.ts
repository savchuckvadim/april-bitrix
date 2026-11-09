/**
 * «Заказать КП на почту» с главной: почта сайта не работает, просьба уходит
 * заявкой в чат — КП пришлёт менеджер.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseOfferRequest } from '../lib/offer-request';
import { POST } from '../route';

const fetchMock = vi.fn<typeof fetch>();

const post = (body: unknown): Promise<Response> =>
    POST(
        new Request('http://localhost/api/mail/send', {
            method: 'POST',
            headers: { 'x-real-ip': '10.4.0.1' },
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
    vi.restoreAllMocks();
});

describe('parseOfferRequest', () => {
    it('корректная почта — заявка «КП на почту»', () => {
        expect(parseOfferRequest({ email: ' client@example.ru ' })).toEqual({
            kind: 'offer',
            email: 'client@example.ru',
            page: '/home',
        });
    });

    it('без почты или с кривой — не заявка', () => {
        expect(parseOfferRequest({})).toBeNull();
        expect(parseOfferRequest({ email: 'не почта' })).toBeNull();
        expect(parseOfferRequest(null)).toBeNull();
    });
});

describe('parseOfferRequest: опечатки', () => {
    it('адрес, который бэк отвергнет, — не заявка (400 до отправки)', () => {
        expect(parseOfferRequest({ email: 'ivan@mail.ru.' })).toBeNull();
        expect(parseOfferRequest({ email: 'ivan..petrov@mail.ru' })).toBeNull();
    });
});

describe('POST /api/mail/send', () => {
    it('просьба уходит в бот видом «КП на почту»', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ resultCode: 0, data: { delivered: true } }));
        const response = await post({ email: 'client@example.ru' });
        expect(response.status).toBe(200);
        expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
            kind: 'offer',
            email: 'client@example.ru',
            page: '/home',
        });
    });

    it('без почты — 400 без отправки', async () => {
        expect((await post({ email: '' })).status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
