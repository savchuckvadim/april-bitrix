import {
    configureBaseURL,
    installAuthInterceptor,

} from '@workspace/nest-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/';

configureBaseURL(API_BASE_URL);

export function setupAuthInterceptor(opts?: {
    onAuthFailed?: () => void;
    onApiError?: (message: string, status: number) => void;
}) {
    installAuthInterceptor({
        onAuthFailed: opts?.onAuthFailed ?? (() => {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }),
        onApiError: opts?.onApiError,
    });
}




