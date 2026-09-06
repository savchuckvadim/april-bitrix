/**
 * HTTP-статус из ошибки запроса: AxiosError несёт его в `response.status`,
 * `ApiClientError` пакета — в `status`. Нет статуса (сеть, таймаут) — null.
 */
const getApiErrorStatus = (error: unknown): number | null => {
    if (!error || typeof error !== 'object') return null;
    const { response, status } = error as {
        response?: { status?: unknown };
        status?: unknown;
    };
    if (typeof response?.status === 'number') return response.status;
    if (typeof status === 'number') return status;
    return null;
};

/**
 * 404 у `audit/latest` — не сбой, а штатный ответ «снапшотов ещё нет»:
 * UI показывает его спокойным текстом, а не красным алертом.
 */
export const isNotFoundError = (error: unknown): boolean =>
    getApiErrorStatus(error) === 404;

/** 403 — признак ai_analytics_audit_enabled на портале выключен. */
export const isForbiddenError = (error: unknown): boolean =>
    getApiErrorStatus(error) === 403;
