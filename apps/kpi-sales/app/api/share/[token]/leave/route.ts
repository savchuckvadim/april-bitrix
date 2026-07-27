import { NextRequest, NextResponse } from 'next/server';

/**
 * Прокси «выход зрителя» (presence leave) — beacon при закрытии/скрытии
 * вкладки. Тело { viewerId }. sendBeacon может слать text/plain — тело
 * пробрасываем как есть, бэк парсит JSON.
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
        await fetch(
            `${backendBase()}/api/kpi-report/share/public/${encodeURIComponent(token)}/leave`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            },
        );
        return NextResponse.json(
            { ok: true },
            { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
        );
    } catch {
        return NextResponse.json({ ok: false }, { status: 502 });
    }
}
