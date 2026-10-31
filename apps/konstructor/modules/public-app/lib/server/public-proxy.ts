import { NextResponse } from 'next/server';

/**
 * Прокси публичной ссылки: браузер видит только наш origin, адрес бэка наружу
 * не светится. KONSTRUCTOR_API_URL читается на старте контейнера, NEXT_PUBLIC_*
 * инлайнится на сборке; без них — дев-дефолт локального бэка.
 */
const backendBase = (): string =>
    (
        process.env.KONSTRUCTOR_API_URL ||
        process.env.NEXT_PUBLIC_KONSTRUCTOR_API_URL ||
        'http://localhost:3007/'
    ).replace(/\/$/, '');

export const publicBackendUrl = (token: string, suffix = ''): string =>
    `${backendBase()}/api/konstructor/public/${encodeURIComponent(token)}${suffix}`;

export const NOINDEX_HEADERS = { 'X-Robots-Tag': 'noindex, nofollow' };

export const proxyError = (status: number, error: string): NextResponse =>
    NextResponse.json({ error }, { status, headers: NOINDEX_HEADERS });

/** GET с разворотом Nest-конверта { resultCode, data }; статус пробрасывается (410). */
export const proxyPublicJson = async (
    token: string,
    suffix = '',
): Promise<NextResponse> => {
    try {
        const response = await fetch(publicBackendUrl(token, suffix), {
            cache: 'no-store',
        });
        if (!response.ok) {
            return proxyError(response.status, 'link unavailable');
        }
        const envelope = (await response.json()) as { data?: unknown };
        return NextResponse.json(
            envelope && typeof envelope === 'object' && 'data' in envelope
                ? envelope.data
                : envelope,
            { headers: NOINDEX_HEADERS },
        );
    } catch (error) {
        console.error('[public proxy] error:', error);
        return proxyError(502, 'public proxy failed');
    }
};
