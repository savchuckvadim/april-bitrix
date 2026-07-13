import { $api } from '../pbx-install-api';

const REFRESH_URL = '/api/auth/refresh';

let refreshPromise: Promise<void> | null = null;

/**
 * Ensures only one refresh request is in-flight at a time.
 * Concurrent callers share the same promise (request coalescing).
 */
export async function refreshTokens(): Promise<void> {
    if (!refreshPromise) {
        refreshPromise = $api
            .post(REFRESH_URL)
            .then(() => {})
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}
