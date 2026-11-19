/**
 * Адрес бэкенда для серверного кода Next (route handlers и серверные
 * страницы). В браузер не попадает: публичные страницы ходят в бэкенд только
 * через наш origin.
 */
export const backendBase = (): string =>
    (
        process.env.KPI_SALES_API_URL ||
        process.env.NEXT_PUBLIC_KPI_SALES_API_URL ||
        'http://localhost:3000/'
    ).replace(/\/$/, '');

/** Nest-конверт { resultCode, data } → чистая нагрузка. */
export const unwrapEnvelope = (envelope: unknown): unknown =>
    envelope && typeof envelope === 'object' && 'data' in envelope
        ? (envelope as { data: unknown }).data
        : envelope;

/** Ответы наших прокси с рабочими данными: не кэшировать, не индексировать. */
export const PRIVATE_HEADERS = {
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow',
} as const;
