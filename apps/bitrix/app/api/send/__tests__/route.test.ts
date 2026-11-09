/**
 * Форма заявки главной (/home): раньше уходила в выведенный бэк и терялась.
 * Проверяем разбор её полей и то, что заявка уходит в бот видом
 * «обратный звонок», а недоставка — честной ошибкой.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseHomeLead } from '../lib/home-lead';
import { POST } from '../route';

const fetchMock = vi.fn<typeof fetch>();

const FORM = {
    name: 'Пётр',
    company: 'ООО Лето',
    email: 'petr@example.ru',
    phone: '+7 900 765-43-21',
    managersCount: '6-10',
    comment: 'Хочу демо',
    privacy: true,
    utm_source: 'yandex',
    utm_medium: 'cpc',
    utm_campaign: '',
    source: 'landing_page',
    lead_source: 'hero',
    timestamp: '2026-11-09T10:00:00.000Z',
};

let ipSeq = 1;
const post = (body: unknown): Promise<Response> =>
    POST(
        new Request('http://localhost/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-real-ip': `10.3.0.${ipSeq++}` },
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

describe('parseHomeLead', () => {
    it('собирает заявку: число менеджеров и метки — в комментарий', () => {
        expect(parseHomeLead(FORM)).toEqual({
            kind: 'callback',
            name: 'Пётр',
            phone: '+7 900 765-43-21',
            email: 'petr@example.ru',
            company: 'ООО Лето',
            comment: 'Хочу демо\nМенеджеров: 6-10\nМетки: yandex, cpc',
            page: '/home',
        });
    });

    it('без имени, без контактов или без согласия — не заявка', () => {
        expect(parseHomeLead({ ...FORM, name: ' ' })).toBeNull();
        expect(parseHomeLead({ ...FORM, phone: '', email: 'не почта' })).toBeNull();
        expect(parseHomeLead({ ...FORM, privacy: false })).toBeNull();
        expect(parseHomeLead('мусор')).toBeNull();
    });
});

describe('parseHomeLead: контакты и длина', () => {
    it('городской телефон без кода при нормальной почте — заявка принимается, телефон уходит как ввели', () => {
        const lead = parseHomeLead({ ...FORM, phone: '234-56-78' });
        expect(lead?.phone).toBe('234-56-78');
        expect(lead?.email).toBe('petr@example.ru');
    });

    it('ни телефона из 10 цифр, ни нормальной почты — не заявка', () => {
        expect(parseHomeLead({ ...FORM, phone: '234-56-78', email: 'petr.@example.ru' })).toBeNull();
    });

    it('комментарий с метками не длиннее потолка бэка', () => {
        const long = parseHomeLead({
            ...FORM,
            comment: 'к'.repeat(1500),
            utm_source: 'u'.repeat(100),
            utm_medium: 'u'.repeat(100),
            utm_campaign: 'u'.repeat(100),
            utm_term: 'u'.repeat(100),
            utm_content: 'u'.repeat(100),
        });
        expect(long?.comment?.length).toBeLessThanOrEqual(2000);
    });
});

describe('POST /api/send', () => {
    it('заявка уходит в бот и отвечает «ок» по ответу бэка', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ resultCode: 0, data: { delivered: true } }));
        const response = await post(FORM);
        expect(response.status).toBe(200);
        const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
        expect(body.kind).toBe('callback');
        expect(body.page).toBe('/home');
    });

    it('кривая форма — 400 без отправки', async () => {
        expect((await post({ ...FORM, privacy: false, comment: 'другая' })).status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('бэк не доставил — 502, а не «отправлено»', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ resultCode: 1 }, { status: 503 }));
        expect((await post({ ...FORM, comment: 'сбой' })).status).toBe(502);
    });
});
