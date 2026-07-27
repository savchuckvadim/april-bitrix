import { NextRequest, NextResponse } from 'next/server';

/**
 * Прокси публичного снимка отчёта: браузер видит только наш origin,
 * URL бэкенда наружу не светится. Разворачивает Nest-конверт
 * { resultCode, data } и пробрасывает статус (410 — ссылка протухла,
 * фронт уводит на bitrix.april-app.ru).
 */
const backendBase = () =>
    (
        process.env.KPI_SALES_API_URL ||
        process.env.NEXT_PUBLIC_KPI_SALES_API_URL ||
        'http://localhost:3000/'
    ).replace(/\/$/, '');

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
) {
    const { token } = await params;
    try {
        // Пробрасываем реальный IP клиента на бэк (уникальные просмотры по IP).
        const clientIp =
            req.headers.get('x-forwarded-for') ??
            req.headers.get('x-real-ip') ??
            '';
        const response = await fetch(
            `${backendBase()}/api/kpi-report/share/public/${encodeURIComponent(token)}`,
            {
                cache: 'no-store',
                headers: clientIp ? { 'x-forwarded-for': clientIp } : {},
            },
        );

        const noindex = { 'X-Robots-Tag': 'noindex, nofollow' };

        if (!response.ok) {
            return NextResponse.json(
                { error: 'link unavailable' },
                { status: response.status, headers: noindex },
            );
        }

        const envelope = (await response.json()) as {
            resultCode?: string;
            data?: unknown;
        };
        // Nest-конверт { resultCode, data } → отдаём чистый payload
        const payload =
            envelope && typeof envelope === 'object' && 'data' in envelope
                ? envelope.data
                : envelope;

        return NextResponse.json(payload, { headers: noindex });
    } catch (error) {
        console.error('[share proxy] error:', error);
        return NextResponse.json(
            { error: 'share proxy failed' },
            { status: 502, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
        );
    }
}
