import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { $api } from '../back-api';
import { refreshTokens } from './auth-refresh-helper';
import { formatApiErrorMessage, type ApiErrorBody } from './auth-error';
import type { AuthInterceptorOptions } from './auth.types';

interface RetryableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];
let isRefreshing = false;

function processQueue(error: unknown | null) {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
    failedQueue = [];
}

function isAuthUrl(url?: string): boolean {
    if (!url) return false;
    return url.includes('/auth/refresh') || url.includes('/auth/login');
}

/**
 * Installs a response interceptor on the shared `$api` axios instance.
 *
 * - On 401 (non-auth routes): attempts token refresh, then retries the original request.
 * - On 401 from refresh/login: calls `onAuthFailed` immediately (no retry loop).
 * - On other errors: parses the Nest error body and calls `onApiError` callback.
 *
 * Call this **once** at app startup (e.g. in a top-level provider or layout).
 */
export function installAuthInterceptor(opts?: AuthInterceptorOptions) {
    $api.interceptors.response.use(
        (response) => response,
        async (error: AxiosError<ApiErrorBody>) => {
            const originalRequest = error.config as RetryableConfig | undefined;
            const status = error.response?.status;
            const requestUrl = originalRequest?.url ?? '';
            const fullUrl = error.request?.responseURL ?? '';

            if (status !== 401) {
                if (error.response) {
                    const message = formatApiErrorMessage(error.response.data);
                    opts?.onApiError?.(message, status!);
                }
                return Promise.reject(error);
            }

            // 401 from refresh or login — stop immediately, no retry
            if (isAuthUrl(requestUrl) || isAuthUrl(fullUrl)) {
                return Promise.reject(error);
            }

            // 401 from a regular request — attempt refresh
            if (!originalRequest || originalRequest._retry) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => $api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await refreshTokens();
                processQueue(null);
                return $api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                opts?.onAuthFailed?.();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        },
    );
}
