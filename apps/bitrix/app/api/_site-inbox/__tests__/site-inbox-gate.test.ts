/**
 * Ворота форм сайта: повтор не уходит второй раз, недоставленное не
 * запоминается (повтор после сбоя уходит), лимит считает только реальные
 * отправки. Ошибка тут — либо дубли в чате, либо потерянная заявка.
 */

import { describe, expect, it, vi } from 'vitest';
import { RecentSubmissions } from '../../calibration/lib/recent-submissions';
import type { SiteInboxStatus, SiteLeadPayload } from '../site-inbox-backend';
import { createSiteLeadGate, siteLeadHttpStatus, siteLeadKey } from '../site-inbox-gate';
import { createVisitorRateLimiter } from '../visitor-rate-limit';

const LEAD: SiteLeadPayload = {
    kind: 'callback',
    name: 'Ирина',
    phone: '+7 (900) 123-45-67',
    page: '/home',
};

const headersOf = (ip: string) => new Headers({ 'x-real-ip': ip });

const gateWith = (statuses: SiteInboxStatus[] = []) => {
    const send = vi.fn<(lead: SiteLeadPayload) => Promise<SiteInboxStatus>>();
    statuses.forEach(status => send.mockResolvedValueOnce(status));
    send.mockResolvedValue('sent');
    const gate = createSiteLeadGate({
        send,
        recent: new RecentSubmissions(),
        limiter: createVisitorRateLimiter({ limit: 2, windowMs: 60_000, maxKeys: 100 }),
        now: () => 0,
    });
    return { gate, send };
};

describe('createSiteLeadGate', () => {
    it('повтор той же заявки — «повтор» без отправки, даже с другой записью телефона', async () => {
        const { gate, send } = gateWith();
        expect(await gate.submit(headersOf('1.1.1.1'), LEAD)).toBe('sent');
        expect(await gate.submit(headersOf('1.1.1.2'), { ...LEAD, phone: '+79001234567', page: '/platform' })).toBe('duplicate');
        expect(send).toHaveBeenCalledTimes(1);
    });

    it('недоставленное не запоминается: повтор после сбоя уходит снова', async () => {
        const { gate, send } = gateWith(['failed']);
        expect(await gate.submit(headersOf('1.1.1.1'), LEAD)).toBe('failed');
        expect(await gate.submit(headersOf('1.1.1.1'), LEAD)).toBe('sent');
        expect(send).toHaveBeenCalledTimes(2);
    });

    it('лимит на посетителя: сверх лимита — отказ без отправки, другой адрес не страдает', async () => {
        const { gate, send } = gateWith();
        expect(await gate.submit(headersOf('2.2.2.2'), { ...LEAD, comment: '1' })).toBe('sent');
        expect(await gate.submit(headersOf('2.2.2.2'), { ...LEAD, comment: '2' })).toBe('sent');
        expect(await gate.submit(headersOf('2.2.2.2'), { ...LEAD, comment: '3' })).toBe('throttled');
        expect(await gate.submit(headersOf('3.3.3.3'), { ...LEAD, comment: '3' })).toBe('sent');
        expect(send).toHaveBeenCalledTimes(3);
    });
});

describe('siteLeadKey', () => {
    it('разный вид заявки — разные заявки', () => {
        expect(siteLeadKey(LEAD)).not.toBe(siteLeadKey({ ...LEAD, kind: 'demo' }));
    });
});

describe('siteLeadHttpStatus', () => {
    it('доставлено и повтор — 200, потолок — 429, недоставка — 502, отказ в полях — 400', () => {
        expect(siteLeadHttpStatus('sent')).toBe(200);
        expect(siteLeadHttpStatus('duplicate')).toBe(200);
        expect(siteLeadHttpStatus('throttled')).toBe(429);
        expect(siteLeadHttpStatus('failed')).toBe(502);
        expect(siteLeadHttpStatus('rejected')).toBe(400);
    });
});
