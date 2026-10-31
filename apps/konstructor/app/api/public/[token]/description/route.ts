import { NextResponse, type NextRequest } from 'next/server';
import {
    NOINDEX_HEADERS,
    proxyError,
    publicBackendUrl,
} from '@/modules/public-app/lib/server/public-proxy';

/** Запрос собирается из наполнения одного комплекта: мегабайтов там не бывает. */
const MAX_BODY_LENGTH = 5_000_000;

/** Описание комплекта по ссылке: DOCX идёт потоком, как его отдал бэк. */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
) {
    const { token } = await params;
    const body = await req.text();
    if (body.length > MAX_BODY_LENGTH) {
        return proxyError(413, 'request too large');
    }
    try {
        const response = await fetch(publicBackendUrl(token, '/description'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            cache: 'no-store',
        });
        if (!response.ok) {
            return proxyError(response.status, 'description unavailable');
        }
        return new NextResponse(response.body, {
            headers: {
                ...NOINDEX_HEADERS,
                'Content-Type':
                    response.headers.get('Content-Type') ??
                    'application/octet-stream',
                'Content-Disposition':
                    response.headers.get('Content-Disposition') ?? 'attachment',
            },
        });
    } catch (error) {
        console.error('[public proxy] description error:', error);
        return proxyError(502, 'public proxy failed');
    }
}
