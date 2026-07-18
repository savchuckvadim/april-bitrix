import { $api } from '../konstructor-api';

/**
 * Bearer-транспорт (принцип «Bearer везде», back/docs/AUTH.md §0):
 * приложение отдаёт пакету геттер токена, пакет прикладывает
 * `Authorization: Bearer <token>` к каждому запросу. Общий JWT
 * (AUTH_JWT_SECRET) → токен, выданный admin-бэком, валиден и здесь (SSO).
 */

type AuthTokenGetter = () => string | null | undefined;

let tokenGetter: AuthTokenGetter = () => null;

/** Подключить источник access-токена (вызывается приложением один раз) */
export function configureAuthTokenGetter(getter: AuthTokenGetter): void {
    tokenGetter = getter;
}

$api.interceptors.request.use(config => {
    const token = tokenGetter();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
