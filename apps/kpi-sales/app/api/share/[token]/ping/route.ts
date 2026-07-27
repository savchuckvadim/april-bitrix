import { NextRequest, NextResponse } from 'next/server';

/**
 * Прокси heartbeat публичного зрителя (presence). Браузер видит только
 * наш origin; бэкенд-URL спрятан. Тело — { viewerId } (per-tab).
 */
const backendBase = () =>
    (
        process.env.KPI_SALES_API_URL ||
        process.env.NEXT_PUBLIC_KPI_SALES_API_URL ||
        'http://localhost:3000/'
    ).replace(/\/$/, '');

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
) {
    const { token } = await params;
    try {
        const body = await req.text();
        const response = await fetch(
            `${backendBase()}/api/kpi-report/share/public/${encodeURIComponent(token)}/ping`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            },
        );
        if (!response.ok) {
            return NextResponse.json(
                { error: 'ping unavailable' },
                { status: response.status, headers: { 'X-Robots-Tag': 'noindex' } },
            );
        }
        const envelope = (await response.json()) as {
            data?: unknown;
        };
        const payload =
            envelope && typeof envelope === 'object' && 'data' in envelope
                ? envelope.data
                : envelope;
        return NextResponse.json(payload, {
            headers: { 'X-Robots-Tag': 'noindex, nofollow' },
        });
    } catch {
        return NextResponse.json(
            { error: 'ping proxy failed' },
            { status: 502 },
        );
    }
}
