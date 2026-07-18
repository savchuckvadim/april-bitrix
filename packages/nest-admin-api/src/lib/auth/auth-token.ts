import { $api } from '../admin-api';

/**
 * Bearer-транспорт (принцип «Bearer везде», back/docs/AUTH.md §0):
 * приложение отдаёт пакету геттер токена, пакет прикладывает
 * `Authorization: Bearer <token>` к каждому запросу.
 *
 * Где токен хранится — решает приложение (admin держит его в cookie
 * СВОЕГО домена только ради persistence/middleware; на бэк cookie
 * не полагаемся — бэки читают именно Bearer-заголовок).
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
