/**
 * Маршрут приёма отзыва руководителя: бэк подменён моком `fetch`, проверяем
 * ровно обязанности двери — куда и какой JSON уходит (подписи → коды),
 * honeypot, повтор, кривое тело, и как ответы бэка (конверт, 400, 429,
 * 5xx, сеть) превращаются в ответ клиенту.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ROP_REVIEW_QUESTION_ID } from '@/app/(product)/ai/constants/rop-review-questionnaire';
import { ROP_REVIEW_SEND_ERROR } from './lib/send-rop-review';
import { POST } from './route';

const ID = ROP_REVIEW_QUESTION_ID;
const LINK = 'https://romashka.bitrix24.ru/crm/type/1036/details/42/';
const DEFAULT_URL =
    'https://api.kpi-sales.april-app.ru/api/ai-analytics/review';

interface SentRequest {
    url: string;
    init: RequestInit | undefined;
}

const respond = (status: number, body: unknown): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
    });

const accepted = (): Promise<Response> =>
    Promise.resolve(respond(200, { resultCode: 0, data: { id: 1 } }));

const sent: SentRequest[] = [];
let respondWith: () => Promise<Response> = accepted;

const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit) => {
        sent.push({ url: String(input), init });
        return respondWith();
    },
);

const post = (body: unknown): Request =>
    new Request('http://localhost/api/rop-review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

type AnswerValue = string | string[];

/** Ответы анкеты подписями, как их шлёт страница; `overrides` меняют отдельные. */
const answers = (overrides: Record<string, AnswerValue | undefined> = {}) => {
    const base: Record<string, AnswerValue | undefined> = {
        [ID.analysisLink]: LINK,
        [ID.authorName]: 'Мария',
        [ID.authorRole]: 'руководитель отдела продаж',
        [ID.verdict]: 'не согласен',
        [ID.issues]: [
            'тип звонка определён неверно',
            'оценка завышена или занижена',
        ],
        [ID.comment]: 'Это не презентация, а повторный созвон',
        [ID.contact]: '+7 900 000-00-00',
        ...overrides,
    };
    return Object.entries(base)
        .filter(([, value]) => value !== undefined)
        .map(([id, value]) => ({ id, value }));
};

const submission = (
    protocol: string,
    extra: Record<string, unknown> = {},
    answerOverrides: Record<string, AnswerValue | undefined> = {},
) => ({
    company: 'ООО Ромашка',
    respondent: 'Иванова',
    domain: LINK,
    protocol,
    website: '',
    answers: answers(answerOverrides),
    ...extra,
});

const sentPayload = (): Record<string, unknown> =>
    JSON.parse(String(sent[0]?.init?.body)) as Record<string, unknown>;

beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    sent.length = 0;
    respondWith = accepted;
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe('штатная отправка', () => {
    it('шлёт JSON с кодами в ручку бэка по адресу по умолчанию', async () => {
        const response = await POST(post(submission('1. Ссылка: …')));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true, parts: 1 });
        expect(sent).toHaveLength(1);
        expect(sent[0]?.url).toBe(DEFAULT_URL);
        expect(sent[0]?.init?.method).toBe('POST');
        expect(sent[0]?.init?.signal).toBeInstanceOf(AbortSignal);
        expect(sentPayload()).toEqual({
            link: LINK,
            authorName: 'Мария',
            authorRole: 'rop',
            verdict: 'disagree',
            issues: ['call_type', 'score'],
            comment: 'Это не презентация, а повторный созвон',
            contact: '+7 900 000-00-00',
            protocol: '1. Ссылка: …',
        });
    });

    it('адрес бэка берётся из KPI_SALES_API_URL, слэш на конце не обязателен', async () => {
        vi.stubEnv('KPI_SALES_API_URL', 'https://kpi.local');
        await POST(post(submission('адрес из окружения')));
        expect(sent[0]?.url).toBe('https://kpi.local/api/ai-analytics/review');
    });

    it('при согласии пункты и комментарий не обязательны, контакт без значения не шлётся', async () => {
        const response = await POST(
            post(
                submission(
                    'согласен целиком',
                    {},
                    {
                        [ID.verdict]: 'согласен с разбором',
                        [ID.issues]: [],
                        [ID.comment]: '',
                        [ID.contact]: undefined,
                    },
                ),
            ),
        );
        expect(response.status).toBe(200);
        const payload = sentPayload();
        expect(payload.verdict).toBe('agree');
        expect(payload.issues).toEqual([]);
        expect(payload.comment).toBe('');
        expect('contact' in payload).toBe(false);
    });

    it('повторы пунктов схлопываются, роль «другое» уходит кодом other', async () => {
        await POST(
            post(
                submission(
                    'повторы пунктов',
                    {},
                    {
                        [ID.authorRole]: 'другое',
                        [ID.issues]: [
                            'другое',
                            'другое',
                            'транскрипт с ошибками',
                        ],
                    },
                ),
            ),
        );
        const payload = sentPayload();
        expect(payload.authorRole).toBe('other');
        expect(payload.issues).toEqual(['other', 'transcript']);
    });
});

describe('защита двери', () => {
    it('honeypot заполнен — «ок» без отправки', async () => {
        const response = await POST(
            post(submission('бот', { website: 'http://spam' })),
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true, parts: 0 });
        expect(sent).toHaveLength(0);
    });

    it('повтор того же протокола — 409 и второй раз не шлём', async () => {
        const body = submission('повторный отзыв руководителя');
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

    it('ссылка не на карточку разбора — 400 с текстом про ссылку', async () => {
        const response = await POST(
            post(
                submission(
                    'кривая ссылка',
                    {},
                    {
                        [ID.analysisLink]:
                            'https://romashka.bitrix24.ru/crm/deal/details/42/',
                    },
                ),
            ),
        );
        expect(response.status).toBe(400);
        expect((await response.json()).error).toContain('карточку разбора');
        expect(sent).toHaveLength(0);
    });

    it('несогласие без комментария и неизвестная подпись варианта — 400', async () => {
        const noComment = await POST(
            post(submission('без комментария', {}, { [ID.comment]: '' })),
        );
        expect(noComment.status).toBe(400);
        const badRole = await POST(
            post(submission('чужая роль', {}, { [ID.authorRole]: 'стажёр' })),
        );
        expect(badRole.status).toBe(400);
        const badIssue = await POST(
            post(submission('чужой пункт', {}, { [ID.issues]: ['погода'] })),
        );
        expect(badIssue.status).toBe(400);
        const noAnswers = await POST(
            post(submission('без ответов', { answers: undefined })),
        );
        expect(noAnswers.status).toBe(400);
        expect(sent).toHaveLength(0);
    });
});

describe('ответы бэка', () => {
    it('resultCode 1 — 400 с текстом бэка', async () => {
        respondWith = () =>
            Promise.resolve(
                respond(200, {
                    resultCode: 1,
                    message: 'ссылка не на разбор этого портала',
                }),
            );
        const response = await POST(post(submission('отклонён конвертом')));
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            ok: false,
            error: 'ссылка не на разбор этого портала',
        });
    });

    it('HTTP 400 — 400 с текстом бэка, без текста — своя подпись', async () => {
        respondWith = () =>
            Promise.resolve(respond(400, { message: 'портал не подключён' }));
        const withText = await POST(post(submission('отклонён статусом')));
        expect(withText.status).toBe(400);
        expect((await withText.json()).error).toBe('портал не подключён');

        respondWith = () => Promise.resolve(new Response('', { status: 400 }));
        const noText = await POST(post(submission('отклонён без текста')));
        expect((await noText.json()).error).toBe(
            ROP_REVIEW_SEND_ERROR.rejected,
        );
    });

    it('429 — «слишком много отправок»', async () => {
        respondWith = () => Promise.resolve(respond(429, {}));
        const response = await POST(post(submission('лимит')));
        expect(response.status).toBe(429);
        expect((await response.json()).error).toBe(
            ROP_REVIEW_SEND_ERROR.tooMany,
        );
    });

    it('5xx, сеть и ответ без конверта — 502, повтор после сбоя не дубль', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        respondWith = () => Promise.resolve(respond(500, {}));
        const server = await POST(post(submission('упадёт бэк')));
        expect(server.status).toBe(502);
        expect((await server.json()).error).toBe(
            ROP_REVIEW_SEND_ERROR.unavailable,
        );

        respondWith = () => Promise.reject(new Error('network down'));
        expect((await POST(post(submission('упадёт бэк')))).status).toBe(502);

        respondWith = () =>
            Promise.resolve(new Response('ok', { status: 200 }));
        expect((await POST(post(submission('упадёт бэк')))).status).toBe(502);

        respondWith = accepted;
        expect((await POST(post(submission('упадёт бэк')))).status).toBe(200);
        expect(sent).toHaveLength(4);
    });
});
