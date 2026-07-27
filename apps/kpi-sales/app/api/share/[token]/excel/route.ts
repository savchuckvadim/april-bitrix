import { NextRequest, NextResponse } from 'next/server';

/**
 * Прокси Excel публичной страницы: тело (DownLoadKpiReportDto, собранный
 * клиентом из данных снимка) уходит на публичную download-ручку бэка,
 * обратно стримится xlsx. Бэк валидирует токен (протух → 410).
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
            `${backendBase()}/api/kpi-report/share/public/${encodeURIComponent(token)}/download`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            },
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'download unavailable' },
                { status: response.status },
            );
        }

        return new NextResponse(response.body, {
            status: 200,
            headers: {
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition':
                    'attachment; filename=kpi-report.xlsx',
                'X-Robots-Tag': 'noindex, nofollow',
            },
        });
    } catch (error) {
        console.error('[share excel proxy] error:', error);
        return NextResponse.json(
            { error: 'share excel proxy failed' },
            { status: 502 },
        );
    }
}
