import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    MAX_BODY_BYTES,
    MAX_EVENTS_PER_BATCH,
} from '@/modules/shared/metrics/lib/metric-contract';
import {
    METRIC,
    METRIC_BATCH_VERSION,
    type SerializedMetricEvent,
} from '@/modules/shared/metrics/model/metric-event.type';

import { POST } from './route';

/**
 * Маршрут приёма метрик — ЕДИНСТВЕННАЯ дверь в реестр, открытая наружу, и до
 * этого файла она не была покрыта вовсе. Проверяем ровно её обязанности:
 * молчать в ответ на что угодно, не пускать поток в память, не давать обойти
 * лимит частоты подделкой заголовка и замолкать по выключателю.
 *
 * Реестр подменён: настоящий — синглтон на `globalThis`, и писать в него из
 * тестов маршрута значило бы портить проверки экспозиции в registry.test.ts.
 */

const { recorded } = vi.hoisted(() => ({
    recorded: [] as SerializedMetricEvent[],
}));

vi.mock('@/app/lib/metrics/registry', () => ({
    recordMetricEvent: (event: SerializedMetricEvent): boolean => {
        recorded.push(event);
        return true;
    },
}));

const URL_STR = 'http://localhost/api/metrics/report';

type RequestArgs = ConstructorParameters<typeof NextRequest>[1];

const makeRequest = (init: Record<string, unknown>): NextRequest =>
    new NextRequest(URL_STR, init as RequestArgs);

/** Обычная пачка строкой — так шлёт браузер. */
const post = (
    body: string,
    headers: Record<string, string> = {},
): NextRequest =>
    makeRequest({
        method: 'POST',
        body,
        headers: { 'content-type': 'application/json', ...headers },
    });

const batch = (events: unknown[]): string =>
    JSON.stringify({ v: METRIC_BATCH_VERSION, events });

const SEND_EVENT = {
    name: METRIC.send,
    labels: { kind: 'report', domain: 'a.bitrix24.ru' },
    value: 1,
};

afterEach(() => {
    recorded.length = 0;
    vi.unstubAllEnvs();
});

describe('штатный приём', () => {
    it('годная пачка: 204 и события ушли в реестр', async () => {
        const res = await POST(
            post(batch([SEND_EVENT]), { 'x-real-ip': '10.0.0.1' }),
        );

        expect(res.status).toBe(204);
        expect(recorded).toHaveLength(1);
        expect(recorded[0]?.name).toBe(METRIC.send);
    });

    it('не-JSON — 400 и ни одной записи', async () => {
        const res = await POST(post('{не json', { 'x-real-ip': '10.0.0.2' }));

        expect(res.status).toBe(400);
        expect(recorded).toHaveLength(0);
    });

    it('чужая версия пачки: 204, но записывать нечего', async () => {
        const res = await POST(
            post(JSON.stringify({ v: 999, events: [SEND_EVENT] }), {
                'x-real-ip': '10.0.0.3',
            }),
        );

        expect(res.status).toBe(204);
        expect(recorded).toHaveLength(0);
    });

    /**
     * РЕГРЕССИЯ (m2 из разбора): клиентский потолок пачки — 200 событий, а
     * серверный потолок тела стоял на 32 КБ. Полная пачка длинных событий это
     * ~40 КБ, то есть маршрут отвечал 413 и терял её ЦЕЛИКОМ (буфер клиента
     * чистится ДО отправки). Худший случай обязан проходить.
     */
    it('полная пачка из самых длинных событий проходит, а не режется', async () => {
        const domain = `${'a'.repeat(51)}.bitrix24.ru`;
        const events = Array.from({ length: MAX_EVENTS_PER_BATCH }, () => ({
            name: METRIC.checklistQuestionHidden,
            labels: {
                reason: 'field-not-in-portal',
                channel: 'smart',
                domain,
            },
            value: 1,
        }));
        const body = batch(events);
        expect(Buffer.byteLength(body)).toBeGreaterThan(32 * 1024);

        const res = await POST(post(body, { 'x-real-ip': '10.0.0.4' }));

        expect(res.status).toBe(204);
        expect(recorded).toHaveLength(MAX_EVENTS_PER_BATCH);
    });
});

describe('потолок тела', () => {
    it('заявленная длина сверх потолка — 413 без чтения тела', async () => {
        const res = await POST(
            post('{}', {
                'x-real-ip': '10.0.1.1',
                'content-length': String(MAX_BODY_BYTES + 1),
            }),
        );

        expect(res.status).toBe(413);
    });

    /**
     * РЕГРЕССИЯ (M2): при `Transfer-Encoding: chunked` заголовка длины НЕТ,
     * и предварительная проверка пропускала любой размер, а `await req.text()`
     * буферизовал тело целиком — обещание «огромное тело не окажется в памяти
     * вовсе» не выполнялось. Проверяем не статус (его отдавал и старый код),
     * а то, что чтение ОБОРВАНО: поток отменён, а вытянуто из него всего
     * несколько десятков килобайт вместо двух мегабайт.
     */
    it('тело потоком без Content-Length: чтение обрывается на потолке', async () => {
        const CHUNKS = 2000;
        const chunk = new Uint8Array(1024).fill(0x41);
        let pulled = 0;
        let cancelled = false;
        const stream = new ReadableStream<Uint8Array>({
            pull(controller) {
                pulled += 1;
                if (pulled > CHUNKS) {
                    controller.close();
                    return;
                }
                controller.enqueue(chunk.slice());
            },
            cancel() {
                cancelled = true;
            },
        });

        const res = await POST(
            makeRequest({
                method: 'POST',
                body: stream,
                duplex: 'half',
                headers: {
                    'content-type': 'application/json',
                    'x-real-ip': '10.0.1.2',
                },
            }),
        );

        expect(res.status).toBe(413);
        expect(cancelled).toBe(true);
        // Потолок 64 КБ = 64 чанка по килобайту; всё, что дальше, читать
        // маршрут права не имеет.
        expect(pulled).toBeLessThan(MAX_BODY_BYTES / 1024 + 5);
        expect(recorded).toHaveLength(0);
    });
});

describe('лимит частоты', () => {
    /**
     * РЕГРЕССИЯ (M1): ключ лимита брался из ПЕРВОГО элемента X-Forwarded-For,
     * а nginx дописывает клиентский заголовок слева. Прислав каждый раз новый
     * XFF, атакующий получал новый ключ на каждый запрос — лимит не
     * срабатывал никогда. Ключ обязан приходить из X-Real-IP, который ставит
     * сам nginx.
     */
    it('подделанный X-Forwarded-For лимит не обходит', async () => {
        const LIMIT = 120;
        let last = 0;
        for (let i = 0; i <= LIMIT; i += 1) {
            const res = await POST(
                post(batch([]), {
                    'x-real-ip': '10.0.2.1',
                    'x-forwarded-for': `203.0.113.${i % 256}, 10.0.2.1`,
                }),
            );
            last = res.status;
        }

        expect(last).toBe(429);
    });

    it('другой источник чужим лимитом не наказан', async () => {
        const res = await POST(
            post(batch([SEND_EVENT]), { 'x-real-ip': '10.0.2.2' }),
        );

        expect(res.status).toBe(204);
    });

    it('без X-Real-IP ключ берётся из ПОСЛЕДНЕГО элемента цепочки', async () => {
        const LIMIT = 120;
        let last = 0;
        for (let i = 0; i <= LIMIT; i += 1) {
            const res = await POST(
                post(batch([]), {
                    'x-forwarded-for': `198.51.100.${i % 256}, 10.0.2.3`,
                }),
            );
            last = res.status;
        }

        expect(last).toBe(429);
    });
});

describe('выключатель', () => {
    it('METRICS_DISABLED=1 — 204 и ни одной записи', async () => {
        vi.stubEnv('METRICS_DISABLED', '1');

        const res = await POST(
            post(batch([SEND_EVENT]), { 'x-real-ip': '10.0.3.1' }),
        );

        expect(res.status).toBe(204);
        expect(recorded).toHaveLength(0);
    });

    it('выключенный приём тело не вычитывает', async () => {
        vi.stubEnv('METRICS_DISABLED', 'true');
        let pulled = 0;
        const stream = new ReadableStream<Uint8Array>({
            pull(controller) {
                pulled += 1;
                controller.enqueue(new Uint8Array(1024).fill(0x41));
            },
        });

        const res = await POST(
            makeRequest({
                method: 'POST',
                body: stream,
                duplex: 'half',
                headers: { 'x-real-ip': '10.0.3.2' },
            }),
        );

        expect(res.status).toBe(204);
        // Единственный чанк, который может быть вытянут, — предвыборка самого
        // рантайма при создании запроса; маршрут не читает НИЧЕГО.
        expect(pulled).toBeLessThanOrEqual(1);
    });
});
