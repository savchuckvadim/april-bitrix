import { AxiosError } from 'axios';

export interface ApiErrorBody {
    message?: string | string[];
    errors?: string[] | string;
}

export class ApiClientError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly body: unknown;

    constructor(message: string, status: number, statusText: string, body: unknown) {
        super(message);
        this.name = 'ApiClientError';
        this.status = status;
        this.statusText = statusText;
        this.body = body;
    }
}

/**
 * Extracts a human-readable error string from a Nest error response body.
 * Prefers `errors` (validation messages), then `message`.
 */
export function formatApiErrorMessage(body: ApiErrorBody | null | undefined): string {
    if (!body) return 'Request failed';

    const rawErrors = body.errors;
    if (Array.isArray(rawErrors) && rawErrors.length > 0) return rawErrors.join('\n');
    if (typeof rawErrors === 'string' && rawErrors.trim()) return rawErrors;

    const msg = body.message;
    if (Array.isArray(msg) && msg.length > 0) return msg.join('\n');
    if (typeof msg === 'string' && msg.trim()) return msg;

    return 'Request failed';
}

/**
 * Extracts a readable error message from any thrown error.
 */
export function getApiErrorMessage(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;

    if (error instanceof AxiosError) {
        const body = error.response?.data as ApiErrorBody | undefined;
        if (body) return formatApiErrorMessage(body);
        return error.message;
    }

    if (error instanceof Error) return error.message;

    return 'Unknown error';
}
