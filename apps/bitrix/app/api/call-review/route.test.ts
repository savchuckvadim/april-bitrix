/**
 * Маршрут приёма брифа оценки звонка: бэк подменён, проверяем ровно
 * обязанности двери — что уходит в Telegram, с какой темой и под каким
 * маркером приложения, части длинного брифа, honeypot, повтор, кривое тело
 * и сбой бэка.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TelegramSendMessageDto } from '@workspace/nest-api';
import { TELEGRAM_PART_MAX_LENGTH } from '../calibration/lib/split-telegram-text';
import { POST } from './route';

const { sent, failNext } = vi.hoisted(() => ({
    sent: [] as TelegramSendMessageDto[],
    failNext: { value: false },
}));

vi.mock('@workspace/nest-api', () => ({
    configureBaseURL: () => undefined,
    getTelegram: () => ({
        telegramGetTelegram: async (dto: TelegramSendMessageDto) => {
            if (failNext.value) throw new Error('backend down');
            sent.push(dto);
        },
    }),
}));

const post = (body: unknown): Request =>
    new Request('http://localhost/api/call-review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
    failNext.value = false;
    vi.restoreAllMocks();
});

describe('штатная отправка', () => {
    it('короткий бриф уходит одним сообщением с темой «Бриф оценки звонка: компания / домен»', async () => {
        const response = await POST(post(submission('1. Вопрос: ответ')));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true, parts: 1 });
        expect(sent).toHaveLength(1);
        expect(
            sent[0]?.text.startsWith(
                'Бриф оценки звонка: ООО Ромашка / romashka.bitrix24.ru\n\n',
            ),
        ).toBe(true);
        expect(sent[0]?.text).toContain('1. Вопрос: ответ');
        expect(sent[0]?.domain).toBe('romashka.bitrix24.ru');
        expect(sent[0]?.userId).toBe('Иванова');
        expect(sent[0]?.app).toBe('bitrix-site-call-review');
    });

    it('длинный бриф уходит частями по порядку, каждая в лимите и с номером', async () => {
        const protocol = Array.from(
            { length: 200 },
            (_, index) => `${index + 1}. Вопрос ${index + 1}: ${'ответ '.repeat(10)}`,
        ).join('\n');
        const response = await POST(post(submission(protocol)));
        const body = (await response.json()) as { ok: boolean; parts: number };
        expect(body.ok).toBe(true);
        expect(body.parts).toBeGreaterThan(1);
        expect(sent).toHaveLength(body.parts);
        sent.forEach((dto, index) => {
            expect(dto.text.length).toBeLessThanOrEqual(TELEGRAM_PART_MAX_LENGTH);
            expect(dto.text.startsWith('Бриф оценки звонка: ')).toBe(true);
            expect(dto.text).toContain(`(часть ${index + 1} из ${body.parts})`);
            expect(dto.app).toBe('bitrix-site-call-review');
        });
        expect(sent[0]?.text).toContain('1. Вопрос 1:');
        expect(sent[sent.length - 1]?.text).toContain('200. Вопрос 200:');
    });

    it('без реквизитов тема честно говорит, что их нет', async () => {
        await POST(post(submission('x', { company: '', domain: '' })));
        expect(
            sent[0]?.text.startsWith('Бриф оценки звонка: реквизиты не указаны'),
        ).toBe(true);
        expect(sent[0]?.domain).toBe('домен не указан');
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
        const body = submission('повторный бриф оценки звонка');
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

    it('сбой бэка — 502 с ошибкой, чтобы клиент предложил повторить', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        failNext.value = true;
        const response = await POST(post(submission('упадёт разбор звонка')));
        expect(response.status).toBe(502);
        expect((await response.json()).ok).toBe(false);
        // повтор после сбоя не считается дублем
        failNext.value = false;
        expect(
            (await POST(post(submission('упадёт разбор звонка')))).status,
        ).toBe(200);
    });
});
