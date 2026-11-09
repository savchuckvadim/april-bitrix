/**
 * Маршрут приёма брифа калибровки: бэк подменён, проверяем ровно обязанности
 * двери — что уходит в бэк, ловушка, повтор, лимит на посетителя, кривое
 * тело и недоставка. Нарезку на части и тему сообщения делает бэк bot —
 * они проверяются его тестами.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
    SiteBriefPayload,
    SiteBriefSendResult,
} from '../_site-inbox/site-inbox-backend';
import { POST } from './route';

const { sent, nextResult } = vi.hoisted(() => ({
    sent: [] as SiteBriefPayload[],
    nextResult: { value: null as SiteBriefSendResult | null },
}));

vi.mock('../_site-inbox/site-inbox-backend', () => ({
    sendSiteLead: async () => 'sent',
    sendSiteBrief: async (payload: SiteBriefPayload): Promise<SiteBriefSendResult> => {
        const result = nextResult.value ?? { status: 'sent', parts: 2 };
        nextResult.value = null;
        if (result.status === 'sent') sent.push(payload);
        return result;
    },
}));

/** Каждый запрос со своего адреса, если тест не задал общий: лимит живёт в модуле. */
let ipSeq = 1;
const post = (body: unknown, ip = `10.1.0.${ipSeq++}`): Request =>
    new Request('http://localhost/api/calibration', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-real-ip': ip },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

const submission = (protocol: string, extra: Record<string, unknown> = {}) => ({
    company: 'ООО Ромашка',
    respondent: 'Иванова',
    domain: 'romashka.bitrix24.ru',
    protocol,
    website: '',
    ...extra,
});

afterEach(() => {
    sent.length = 0;
    nextResult.value = null;
    vi.restoreAllMocks();
});

describe('штатная отправка', () => {
    it('бриф уходит в бэк видом «калибровка» с реквизитами, число частей — из ответа бэка', async () => {
        const response = await POST(post(submission('1. Вопрос: ответ')));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true, parts: 2 });
        expect(sent).toEqual([
            {
                kind: 'calibration',
                company: 'ООО Ромашка',
                respondent: 'Иванова',
                domain: 'romashka.bitrix24.ru',
                protocol: '1. Вопрос: ответ',
                page: '/ai/briefs',
            },
        ]);
    });
});

describe('защита двери', () => {
    it('honeypot заполнен — «ок» без отправки', async () => {
        const response = await POST(post(submission('бот', { website: 'http://spam' })));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true, parts: 0 });
        expect(sent).toHaveLength(0);
    });

    it('повтор того же протокола — 409 и второй раз не шлём', async () => {
        const body = submission('повторный бриф');
        expect((await POST(post(body))).status).toBe(200);
        const second = await POST(post(body));
        expect(second.status).toBe(409);
        expect(sent).toHaveLength(1);
    });

    it('не JSON и тело без протокола — 400', async () => {
        expect((await POST(post('{oops'))).status).toBe(400);
        expect((await POST(post({ company: 'x' }))).status).toBe(400);
        expect((await POST(post(submission('   ')))).status).toBe(400);
        expect(sent).toHaveLength(0);
    });

    it('с одного адреса — не больше трёх брифов за 10 минут', async () => {
        const ip = '203.0.113.20';
        for (let i = 0; i < 3; i += 1) {
            expect((await POST(post(submission(`бриф ${i}`), ip))).status).toBe(200);
        }
        expect((await POST(post(submission('бриф 4'), ip))).status).toBe(429);
        expect(sent).toHaveLength(3);
    });

    it('бэк перегружен — 429 «попробуйте через минуту»', async () => {
        nextResult.value = { status: 'throttled', parts: 0 };
        const response = await POST(post(submission('в час пик')));
        expect(response.status).toBe(429);
        expect((await response.json()).ok).toBe(false);
    });

    it('бэк не доставил — 502, чтобы клиент предложил повторить; повтор после сбоя уходит', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        nextResult.value = { status: 'failed', parts: 0 };
        const response = await POST(post(submission('упадёт')));
        expect(response.status).toBe(502);
        expect((await response.json()).ok).toBe(false);
        expect((await POST(post(submission('упадёт')))).status).toBe(200);
    });
});
