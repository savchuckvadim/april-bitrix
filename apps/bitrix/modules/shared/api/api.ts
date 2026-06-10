import {
    configureBaseURL,
    installAuthInterceptor,
    getAuth,
    getBitrixSetupApp,
    getPortalKonstructor,
} from '@workspace/nest-api';
import { getBitrixAppClientApp } from '@workspace/nest-api/src/generated/bitrix-app-client-app/bitrix-app-client-app';

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

export const apiAuth = getAuth();
export const apiApp = getBitrixAppClientApp();
export const apiSetup = getBitrixSetupApp();
export const apiPortal = getPortalKonstructor();

export { API_BASE_URL };
