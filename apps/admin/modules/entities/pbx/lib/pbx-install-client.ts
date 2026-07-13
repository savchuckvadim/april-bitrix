import { configureBaseURL, installAuthInterceptor } from '@workspace/nest-pbx-install-api';

/**
 * One-time configuration of the `@workspace/pbx-install-api` axios instance.
 *
 * Imported for its side effects from the pbx entity helpers so the base URL and
 * auth interceptor are set before the first request. Mirrors the nest-api setup
 * in `modules/shared/lib/api/nest-client`.
 */
const PBX_INSTALL_API_URL =
    process.env.NEXT_PUBLIC_PBX_INSTALL_API_URL ||
    'https://api.install.april-app.ru/';

let configured = false;
console.log(PBX_INSTALL_API_URL, 'PBX_INSTALL_API_URL');

export function ensurePbxInstallClient() {
    if (configured) return;
    configured = true;

    configureBaseURL(PBX_INSTALL_API_URL);
    installAuthInterceptor({
        onAuthFailed: () => {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        },
    });
}

ensurePbxInstallClient();
