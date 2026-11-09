import { SITE_MEDIA_FILE_NAME_PATTERN, SITE_MEDIA_KEY_PATTERN } from '@workspace/site-media';
import { botApiUrl } from '@/lib/bot-api';

/**
 * Картинки и видео сайта со своего адреса: `/media/<раздел>/<файл>` →
 * бэк (apps/bot, `GET api/site-media/<раздел>/files/<файл>`). Браузер не
 * знает адреса сервера. Range уходит на бэк как есть — видео перематывается
 * кусками; кеш браузера — вечный, в имени файла отпечаток содержимого.
 *
 * Картинки через next/image идут сюда же: оптимизатор Next запрашивает этот
 * адрес у своего сервера и кеширует уменьшенные копии.
 */

/** Заголовки посетителя, нужные для кусков видео и проверки кеша. */
const FORWARD_REQUEST_HEADERS = ['range', 'if-range', 'if-none-match', 'if-modified-since'] as const;

/** Заголовки бэка, которые получает посетитель. */
const FORWARD_RESPONSE_HEADERS = [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'cache-control',
    'etag',
    'last-modified',
    'x-content-type-options',
] as const;

/** Ответы бэка, которые уходят посетителю как есть: файл, кусок, «не изменился», «нет такого куска». */
const PASS_THROUGH_STATUSES = new Set([200, 206, 304, 416]);

/** Ждём только начала ответа, а не всю отдачу: ролик по медленной сети идёт дольше. */
const CONNECT_TIMEOUT_MS = 10_000;

export const dynamic = 'force-dynamic';

interface MediaRouteContext {
    params: Promise<{ section: string; file: string }>;
}

const pickHeaders = (source: Headers, names: readonly string[]): Headers => {
    const picked = new Headers();
    for (const name of names) {
        const value = source.get(name);
        if (value !== null) picked.set(name, value);
    }
    return picked;
};

const status = (code: number): Response => new Response(null, { status: code });

export async function GET(request: Request, { params }: MediaRouteContext): Promise<Response> {
    const { section, file } = await params;
    if (!SITE_MEDIA_KEY_PATTERN.test(section) || !SITE_MEDIA_FILE_NAME_PATTERN.test(file)) {
        return status(404);
    }

    const connect = new AbortController();
    const timer = setTimeout(() => connect.abort(), CONNECT_TIMEOUT_MS);
    let upstream: Response;
    try {
        upstream = await fetch(botApiUrl(`api/site-media/${section}/files/${file}`), {
            headers: pickHeaders(request.headers, FORWARD_REQUEST_HEADERS),
            signal: connect.signal,
            cache: 'no-store',
        });
    } catch (error) {
        console.error(`Media ${section}/${file}: бэк не ответил`, error);
        return status(502);
    } finally {
        clearTimeout(timer);
    }

    if (upstream.status === 404) return status(404);
    if (!PASS_THROUGH_STATUSES.has(upstream.status)) {
        console.error(`Media ${section}/${file}: бэк ответил ${upstream.status}`);
        return status(502);
    }

    const headers = pickHeaders(upstream.headers, FORWARD_RESPONSE_HEADERS);
    // fetch уже распаковал сжатое тело — прежняя длина ему не соответствует.
    if (upstream.headers.has('content-encoding')) headers.delete('content-length');
    // У «не изменился» тела нет и быть не может — Response иначе бросит.
    const body = upstream.status === 304 ? null : upstream.body;
    return new Response(body, { status: upstream.status, headers });
}
