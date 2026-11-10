import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { $api } from './konstructor-api';

/**
 * Сессия портала (back/libs/auth/portal-session) для фрейма конструктора:
 * фронт обменивает auth-данные фрейма Bitrix24 на JWT ручкой
 * `POST /api/auth/portal-session` и держит его в памяти — здесь. Пакет
 * прикладывает `Authorization: Bearer <token>` к каждому запросу, а на 401
 * один раз переоткрывает сессию через зарегистрированный refresh и повторяет
 * запрос. Тот же контракт, что у nest-kpi-report-sales-api и
 * nest-event-sales-api. Админка этим не пользуется: у неё свой токен
 * (configureAuthTokenGetter).
 */

/** Повторный обмен auth-данных фрейма на токен; null — сессию не переоткрыть. */
export type PortalSessionRefresh = () => Promise<string | null>;

/**
 * Путь ручки обмена. Её собственный 401 (портал не подтвердил токен фрейма)
 * не повторяем — иначе refresh → 401 → refresh по кругу.
 */
export const PORTAL_SESSION_OPEN_PATH = '/api/auth/portal-session';

/** Конфиг с пометкой «уже повторён после 401»: второй 401 подряд не зацикливает. */
type PortalSessionRequestConfig = InternalAxiosRequestConfig & {
    portalSessionRetried?: boolean;
};

let portalSessionToken: string | null = null;
let portalSessionRefresh: PortalSessionRefresh | null = null;
/** Один переоткрывающий обмен на все запросы, упавшие с 401 одновременно. */
let portalSessionRefreshInFlight: Promise<string | null> | null = null;

/** Положить (или сбросить — null) токен сессии для всех запросов. */
export function setPortalSessionToken(token: string | null): void {
    portalSessionToken = token;
}

export function getPortalSessionToken(): string | null {
    return portalSessionToken;
}

/** Зарегистрировать (или снять — null) переоткрытие сессии на 401. */
export function setPortalSessionRefresh(
    refresh: PortalSessionRefresh | null,
): void {
    portalSessionRefresh = refresh;
}

const refreshPortalSessionOnce = (
    refresh: PortalSessionRefresh,
): Promise<string | null> => {
    if (!portalSessionRefreshInFlight) {
        portalSessionRefreshInFlight = refresh()
            .catch(() => null)
            .finally(() => {
                portalSessionRefreshInFlight = null;
            });
    }
    return portalSessionRefreshInFlight;
};

const isPortalSessionOpen = (config: AxiosRequestConfig): boolean =>
    (config.url ?? '').includes(PORTAL_SESSION_OPEN_PATH);

$api.interceptors.request.use(config => {
    if (portalSessionToken) {
        config.headers.set('Authorization', `Bearer ${portalSessionToken}`);
    }
    return config;
});

$api.interceptors.response.use(
    response => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
            throw error;
        }
        const refresh = portalSessionRefresh;
        const config = error.config as PortalSessionRequestConfig | undefined;
        if (
            !refresh ||
            !config ||
            config.portalSessionRetried ||
            isPortalSessionOpen(config)
        ) {
            throw error;
        }
        config.portalSessionRetried = true;
        const token = await refreshPortalSessionOnce(refresh);
        if (!token) throw error;
        setPortalSessionToken(token);
        return $api.request(config);
    },
);
