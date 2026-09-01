import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

/**
 * Отдача метрик закрыта общим секретом, и проверяем мы здесь ровно одно:
 * закрыта ли она НА САМОМ ДЕЛЕ. Повод предметный — 31.08 адрес
 * `https://next.april-app.ru/sales/api/metrics` открывался из интернета кем
 * угодно, а в теле лежит разрез по доменам всех клиентских порталов.
 *
 * Реестр подменён: настоящий — синглтон на `globalThis`, и дёргать его из
 * тестов маршрута значило бы портить проверки экспозиции в registry.test.ts.
 */

vi.mock('@/app/lib/metrics/registry', () => ({
    getBusinessMetrics: () => ({
        registry: {
            metrics: async () => 'event_sales_send_total 1\n',
            contentType: 'text/plain; version=0.0.4; charset=utf-8',
        },
    }),
}));

const URL_STR = 'http://localhost/api/metrics';

const TOKEN = 's3cr3t-scrape-token';

const get = (headers: Record<string, string> = {}): NextRequest =>
    new NextRequest(URL_STR, { method: 'GET', headers });

const originalToken = process.env.METRICS_SCRAPE_TOKEN;

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    if (originalToken === undefined) delete process.env.METRICS_SCRAPE_TOKEN;
    else process.env.METRICS_SCRAPE_TOKEN = originalToken;
});

describe('GET /api/metrics — отдача закрыта секретом', () => {
    it('без токена в окружении не отдаёт ничего (закрыто по умолчанию)', async () => {
        delete process.env.METRICS_SCRAPE_TOKEN;

        const response = await GET(get({ authorization: `Bearer ${TOKEN}` }));

        expect(response.status).toBe(404);
        await expect(response.text()).resolves.toBe('');
    });

    it('пустой токен в окружении равносилен незаданному', async () => {
        process.env.METRICS_SCRAPE_TOKEN = '   ';

        const response = await GET(get({ authorization: 'Bearer    ' }));

        expect(response.status).toBe(404);
    });

    it('без заголовка авторизации — 404, а не список порталов', async () => {
        process.env.METRICS_SCRAPE_TOKEN = TOKEN;

        const response = await GET(get());

        expect(response.status).toBe(404);
        await expect(response.text()).resolves.toBe('');
    });

    it('с чужим токеном — 404', async () => {
        process.env.METRICS_SCRAPE_TOKEN = TOKEN;

        const response = await GET(get({ authorization: 'Bearer wrong-token' }));

        expect(response.status).toBe(404);
    });

    it('токен-префикс верного не проходит — сравнение полное, не по началу', async () => {
        process.env.METRICS_SCRAPE_TOKEN = TOKEN;

        const response = await GET(
            get({ authorization: `Bearer ${TOKEN.slice(0, -1)}` }),
        );

        expect(response.status).toBe(404);
    });

    it('другая схема авторизации не проходит', async () => {
        process.env.METRICS_SCRAPE_TOKEN = TOKEN;

        const response = await GET(get({ authorization: `Basic ${TOKEN}` }));

        expect(response.status).toBe(404);
    });

    it('с верным токеном отдаёт метрики', async () => {
        process.env.METRICS_SCRAPE_TOKEN = TOKEN;

        const response = await GET(get({ authorization: `Bearer ${TOKEN}` }));

        expect(response.status).toBe(200);
        await expect(response.text()).resolves.toContain('event_sales_send_total');
        expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('схема регистронезависима — клиенты шлют и `bearer`', async () => {
        process.env.METRICS_SCRAPE_TOKEN = TOKEN;

        const response = await GET(get({ authorization: `bearer ${TOKEN}` }));

        expect(response.status).toBe(200);
    });

    it('токен в окружении с краевыми пробелами всё равно совпадает', async () => {
        process.env.METRICS_SCRAPE_TOKEN = `  ${TOKEN}  `;

        const response = await GET(get({ authorization: `Bearer ${TOKEN}` }));

        expect(response.status).toBe(200);
    });
});
