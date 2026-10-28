import {
    configureBaseURL as configureAdminBaseURL,
    configureAuthTokenGetter as configureAdminAuthToken,
    installAuthInterceptor as installAdminAuthInterceptor,
} from '@workspace/nest-admin-api';
import {
    configureBaseURL as configureKonstructorBaseURL,
    configureAuthTokenGetter as configureKonstructorAuthToken,
} from '@workspace/nest-konstructor-api';
import { configureAuthTokenGetter as configurePbxInstallAuthToken } from '@workspace/nest-pbx-install-api';
import { getAccessToken } from './auth-token-storage';

// Дефолты localhost — только для dev. Прод-адреса задаёт
// deploy-front-prod.yml (APP_CFG.admin), пустое значение там валит сборку.
const ADMIN_API_BASE_URL =
    process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3004/';
const KONSTRUCTOR_API_BASE_URL =
    process.env.NEXT_PUBLIC_KONSTRUCTOR_API_URL || 'http://localhost:3007/';
if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.NEXT_PUBLIC_ADMIN_API_URL ||
        !process.env.NEXT_PUBLIC_KONSTRUCTOR_API_URL)
) {
    console.error(
        'admin: прод-сборка без NEXT_PUBLIC_ADMIN_API_URL / NEXT_PUBLIC_KONSTRUCTOR_API_URL — запросы уйдут на localhost',
    );
}
configureAdminBaseURL(ADMIN_API_BASE_URL);
configureKonstructorBaseURL(KONSTRUCTOR_API_BASE_URL);

// «Bearer везде»: один источник токена (cookie фронт-домена) для всех
// api-пакетов — admin, konstructor и pbx-install (общий JWT → SSO).
configureAdminAuthToken(getAccessToken);
configureKonstructorAuthToken(getAccessToken);
configurePbxInstallAuthToken(getAccessToken);

/**
 * Установка 401-интерцептора (идемпотентно). Вызывается ЯВНО из
 * AuthProvider (modules/features/auth) — side-эффектов при импорте нет,
 * SSR не затрагивается (интерцептор нужен только клиентским запросам).
 */
let interceptorInstalled = false;

export function setupAuthInterceptor(opts?: {
    onAuthFailed?: () => void;
    onApiError?: (message: string, status: number) => void;
}) {
    if (interceptorInstalled) {
        return;
    }
    interceptorInstalled = true;
    installAdminAuthInterceptor({
        onAuthFailed:
            opts?.onAuthFailed ??
            (() => {
                if (typeof window !== 'undefined') {
                    const returnTo = encodeURIComponent(
                        window.location.pathname + window.location.search,
                    );
                    window.location.href = `/auth/login?returnTo=${returnTo}`;
                }
            }),
        onApiError: opts?.onApiError,
    });
}
