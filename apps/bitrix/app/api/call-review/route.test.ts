/**
 * Маршрут приёма брифа оценки звонка: бэк подменён, проверяем ровно
 * обязанности двери — что уходит в бэк и каким видом, ловушка, повтор,
 * кривое тело и недоставка. Нарезку на части и тему делает бэк bot.
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
        const result = nextResult.value ?? { status: 'sent', parts: 1 };
        nextResult.value = null;
        if (result.status === 'sent') sent.push(payload);
        return result;
    },
}));

/** Каждый запрос со своего адреса: лимит на посетителя живёт в модуле. */
let ipSeq = 1;
const post = (body: unknown): Request =>
    new Request('http://localhost/api/call-review', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-real-ip': `10.2.0.${ipSeq++}` },
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
    it('бриф уходит в бэк видом «оценка звонка» с реквизитами', async () => {
        const response = await POST(post(submission('Звонок: ссылка на запись')));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true, parts: 1 });
        expect(sent).toEqual([
            {
                kind: 'call-review',
                company: 'ООО Ромашка',
                respondent: 'Иванова',
                domain: 'romashka.bitrix24.ru',
                protocol: 'Звонок: ссылка на запись',
                page: '/ai/briefs',
            },
        ]);
    });
});

describe('защита двери', () => {
    it('honeypot заполнен — «ок» без отправки', async () => {
        const response = await POST(post(submission('бот', { website: 'http://spam' })));
        expect(response.status).toBe(200);
        expect(sent).toHaveLength(0);
    });

    it('повтор того же протокола — 409 и второй раз не шлём', async () => {
        const body = submission('повторный бриф');
        expect((await POST(post(body))).status).toBe(200);
        expect((await POST(post(body))).status).toBe(409);
        expect(sent).toHaveLength(1);
    });

    it('не JSON и тело без протокола — 400', async () => {
        expect((await POST(post('{oops'))).status).toBe(400);
        expect((await POST(post({ company: 'x' }))).status).toBe(400);
        expect(sent).toHaveLength(0);
    });

    it('бэк не доставил — 502 с ошибкой, чтобы клиент предложил повторить', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        nextResult.value = { status: 'failed', parts: 0 };
        const response = await POST(post(submission('упадёт')));
        expect(response.status).toBe(502);
        expect((await response.json()).ok).toBe(false);
    });
});
