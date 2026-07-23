import { logServer } from '@/modules/app/lib/server/log/logServer';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Приём установки Bitrix-приложения (ONAPPINSTALL / PLACEMENT=DEFAULT).
 * Роут — тонкий форвардер: сырое тело и query уходят на бэк
 * kpi-report-sales (BitrixSetupInstallController), который парсит payload
 * и сохраняет токены в БД. Legacy online API больше не используется.
 */
const backendBase = () =>
    (
        process.env.KPI_SALES_API_URL ||
        process.env.NEXT_PUBLIC_KPI_SALES_API_URL ||
        'http://localhost:3000/'
    ).replace(/\/$/, '');

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const query = req.nextUrl.searchParams.toString();

        logServer(
            'info',
            'install',
            'api/bitrix/install',
            'KPI REPORT SALES install forward',
            req.nextUrl.searchParams.get('DOMAIN') ?? 'unknown',
            '',
            { query },
            new Date().toISOString(),
        );

        const response = await fetch(
            `${backendBase()}/api/bitrix-setup-install/install${query ? `?${query}` : ''}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        req.headers.get('content-type') ??
                        'application/x-www-form-urlencoded',
                },
                body: rawBody,
                // бэк отвечает redirect'ом — нам важен только статус
                redirect: 'manual',
            },
        );

        const installStatus =
            response.ok || (response.status >= 300 && response.status < 400)
                ? 'success'
                : 'fail';

        const redirectUrl = new URL('/install', req.url);
        redirectUrl.searchParams.set('install', installStatus);
        return NextResponse.redirect(redirectUrl, 302);
    } catch (error) {
        console.error('[Bitrix Install] error:', error);
        const errorRedirect = new URL('/install', req.url);
        errorRedirect.searchParams.set('install', 'fail');
        return NextResponse.redirect(errorRedirect, 302);
    }
}
