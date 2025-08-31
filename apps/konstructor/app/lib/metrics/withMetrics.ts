// lib/metrics/with-metrics.ts
import { httpRequestCounter, httpRequestDuration } from './metrics';
import { NextRequest } from 'next/server';

export async function withMetrics(
    req: NextRequest,
    handler: () => Promise<Response>,
) {
    const start = Date.now();
    const url = req.nextUrl.pathname;
    const method = req.method;

    try {
        const res = await handler();
        const duration = (Date.now() - start) / 1000;
        httpRequestCounter.inc({
            method,
            route: url,
            status: String(res.status),
        });
        httpRequestDuration.observe(
            { method, route: url, status: String(res.status) },
            duration,
        );
        return res;
    } catch (e) {
        const status = '500';
        const duration = (Date.now() - start) / 1000;
        httpRequestCounter.inc({ method, route: url, status });
        httpRequestDuration.observe({ method, route: url, status }, duration);
        throw e;
    }
}
