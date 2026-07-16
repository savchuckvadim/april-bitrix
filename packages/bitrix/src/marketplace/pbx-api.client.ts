import { portalSessionStore } from './session.store';

/**
 * ЕДИНЫЙ клиент API маркетплейса (api.pbx.april-app.ru) для всех фронтов.
 *
 * Правила (одинаковые для любого вызова — «единый ретрай и прочее»):
 *  - Bearer из in-memory стора сессии (cookies не используются);
 *  - таймаут на запрос (AbortController), 15с;
 *  - РЕТРАЙ: только идемпотентные GET и только на сетевые ошибки/5xx,
 *    максимум 2 повтора с экспоненциальным backoff (300мс → 600мс).
 *    POST не ретраится автоматически (побочные эффекты);
 *  - 401 → portalSessionStore.markExpired() + SessionExpiredError:
 *    у portal-context токена нет refresh — сессия восстанавливается
 *    ТОЛЬКО переоткрытием приложения из Битрикса (новый одноразовый код);
 *  - ошибки Nest (message из тела) пробрасываются как PbxApiError
 *    с понятным русским текстом для UI.
 *
 * Без зависимостей: нативный fetch (Next.js/браузер).
 */

const DEFAULT_BASE_URL = 'https://api.pbx.april-app.ru';
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_GET_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

export class PbxApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = 'PbxApiError';
    }
}

export class SessionExpiredError extends Error {
    constructor() {
        super(
            'Сессия истекла — переоткройте приложение из меню Битрикс24',
        );
        this.name = 'SessionExpiredError';
    }
}

interface RequestOptions {
    method: 'GET' | 'POST';
    path: string;
    body?: unknown;
    /** Запрос без Bearer (например, session/exchange) */
    anonymous?: boolean;
}

function getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_PBX_API_URL ?? DEFAULT_BASE_URL;
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseErrorMessage(response: Response): Promise<string> {
    try {
        const body = (await response.json()) as {
            message?: string | string[];
        };
        if (Array.isArray(body.message)) return body.message.join('; ');
        if (typeof body.message === 'string') return body.message;
    } catch {
        // тело не JSON — используем статус
    }
    return `Ошибка запроса (${response.status})`;
}

async function performFetch(options: RequestOptions): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (!options.anonymous) {
            const token = portalSessionStore.getToken();
            if (token) headers.Authorization = `Bearer ${token}`;
        }
        return await fetch(`${getBaseUrl()}${options.path}`, {
            method: options.method,
            headers,
            body:
                options.body !== undefined
                    ? JSON.stringify(options.body)
                    : undefined,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }
}

/** Единая точка запросов к api.pbx: ретраи, 401, разбор ошибок */
export async function pbxRequest<TResponse>(
    options: RequestOptions,
): Promise<TResponse> {
    const retriable = options.method === 'GET';
    let lastError: unknown;

    for (let attempt = 0; attempt <= (retriable ? MAX_GET_RETRIES : 0); attempt++) {
        if (attempt > 0) {
            await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
        }
        try {
            const response = await performFetch(options);

            if (response.status === 401 && !options.anonymous) {
                portalSessionStore.markExpired();
                throw new SessionExpiredError();
            }
            if (response.status >= 500 && retriable) {
                lastError = new PbxApiError(
                    await parseErrorMessage(response),
                    response.status,
                );
                continue; // 5xx на GET — ретраим
            }
            if (!response.ok) {
                throw new PbxApiError(
                    await parseErrorMessage(response),
                    response.status,
                );
            }
            return (await response.json()) as TResponse;
        } catch (error) {
            if (
                error instanceof SessionExpiredError ||
                error instanceof PbxApiError
            ) {
                throw error; // бизнес-ошибки не ретраим
            }
            lastError = error; // сетевая/таймаут — ретраим GET
            if (!retriable) break;
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new PbxApiError('Сервис недоступен — попробуйте позже', 0);
}
