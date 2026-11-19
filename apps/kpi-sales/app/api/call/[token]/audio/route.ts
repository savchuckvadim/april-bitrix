import { NextRequest, NextResponse } from 'next/server';
import { PRIVATE_HEADERS, backendBase } from '../../../../_lib/backend';

/** Заголовки записи, которые пересылаем браузеру как есть. */
const PASS_HEADERS = [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
] as const;

/**
 * Запись разговора для страницы звонка: браузер видит только наш origin.
 * Заголовок Range (перемотка) уходит в бэкенд, ответ пересылается потоком —
 * файл в память не складывается. Адреса бэкенда и Битрикса наружу не идут.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
) {
    const { token } = await params;
    const range = req.headers.get('range');
    try {
        const upstream = await fetch(
            `${backendBase()}/api/ai-analytics/call-page/${encodeURIComponent(token)}/audio`,
            {
                cache: 'no-store',
                headers: range ? { range } : {},
                signal: req.signal,
            },
        );
        if (!upstream.ok || !upstream.body) {
            return NextResponse.json(
                { error: 'Запись недоступна' },
                {
                    status: upstream.status === 416 ? 416 : 404,
                    headers: PRIVATE_HEADERS,
                },
            );
        }
        const headers = new Headers(PRIVATE_HEADERS);
        for (const name of PASS_HEADERS) {
            const value = upstream.headers.get(name);
            if (value) headers.set(name, value);
        }
        return new Response(upstream.body, {
            status: upstream.status,
            headers,
        });
    } catch (error) {
        if (!req.signal.aborted) {
            console.error('[call audio proxy] ошибка:', error);
        }
        return NextResponse.json(
            { error: 'Запись недоступна' },
            { status: 502, headers: PRIVATE_HEADERS },
        );
    }
}
