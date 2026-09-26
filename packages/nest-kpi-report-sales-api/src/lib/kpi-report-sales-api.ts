import axios, {
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios';

export interface IBackResponse<T> {
    resultCode: EResultCode;
    data?: T;
    message?: string;
    errors?: string[];
}

export enum EResultCode {
    SUCCESS = 0,
    ERROR = 1,
}

// Локальный дев-порт back/apps/kpi-report-sales (PORT из apps/kpi-report-sales/.env);
// в приложении переопределяется через configureBaseURL.
let _baseURL = 'http://localhost:3000/';
// let _baseURL = 'https://api.kpi-sales.april-app.ru/'; // prod URL (порт 8223 в ports.env)
export function configureBaseURL(url: string) {
    _baseURL = url;
    $api.defaults.baseURL = url;
}

export const $api = axios.create({
    baseURL: _baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Portal-context сессия (back/libs/auth/portal-session): фронт во фрейме
 * Bitrix24 обменивает auth-данные фрейма на JWT ручкой
 * `POST /api/auth/portal-session` и держит его в памяти — здесь. Пакет
 * прикладывает `Authorization: Bearer <token>` к каждому запросу, а на 401
 * один раз переоткрывает сессию через зарегистрированный refresh и
 * повторяет запрос (принцип «Bearer везде»: без cookies в iframe).
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

/** Положить (или сбросить — null) portal-context токен для всех запросов. */
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

/**
 * Orval mutator — all generated API calls go through this function.
 * Unwraps the Nest `{ resultCode, data, message }` envelope.
 */
export const customAxios = async <T>(
    config: AxiosRequestConfig,
): Promise<T> => {

    if (config.responseType && config.responseType !== 'json') {
        const res = await $api.request<T>(config);
        return res.data;
    }

    const res = await $api.request<IBackResponse<T>>(config);

    if (res.data.resultCode !== EResultCode.SUCCESS) {
        throw new Error(res.data.message || `Backend error ${config.url}`);
    }

    return res.data.data as T;
};
