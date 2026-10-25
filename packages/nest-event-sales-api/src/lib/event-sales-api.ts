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

// prod URL — TBD (домен для back/apps/event-sales ещё не заведён)
let _baseURL = 'http://localhost:3005/';
// let _baseURL = 'https://api.event-sales.april-app.ru/';
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
 * Portal-context сессия (back/libs/auth/portal-session) — как в
 * nest-kpi-report-sales-api: токен в памяти, `Authorization: Bearer` на
 * каждый запрос, на 401 — одно переоткрытие через зарегистрированный
 * refresh и повтор запроса. Нужна ручкам, которые без сессии не пускают
 * (работа «Звонков» через сервер: bitrix-proxy/frame).
 */

/** Повторный обмен auth-данных фрейма на токен; null — не переоткрыть. */
export type PortalSessionRefresh = () => Promise<string | null>;

/** Ручка обмена: её собственный 401 не повторяем — иначе круг. */
export const PORTAL_SESSION_OPEN_PATH = '/api/auth/portal-session';

type PortalSessionRequestConfig = InternalAxiosRequestConfig & {
    portalSessionRetried?: boolean;
};

let portalSessionToken: string | null = null;
let portalSessionRefresh: PortalSessionRefresh | null = null;
/** Один переоткрывающий обмен на все запросы, упавшие с 401 разом. */
let portalSessionRefreshInFlight: Promise<string | null> | null = null;

/** Положить (или сбросить — null) portal-context токен. */
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
            (config.url ?? '').includes(PORTAL_SESSION_OPEN_PATH)
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
 * Сколько ждать ответа на запрос, мс. `undefined` или 0 — без ограничения.
 *
 * Правило задаёт приложение, а не пакет: только оно знает, какие ручки
 * интерактивные (человек ждёт у экрана и должен получить ошибку с кнопкой
 * «повторить», а не вечный скелетон), а какие заведомо долгие или пишущие
 * (обрывать их таймаутом нельзя — на сервере запись всё равно выполнится).
 */
export type RequestTimeoutResolver = (request: {
    url?: string;
    method?: string;
}) => number | undefined;

let _resolveTimeout: RequestTimeoutResolver | null = null;

/** По умолчанию правила нет: запросы без таймаута, как и раньше. */
export function configureRequestTimeout(
    resolver: RequestTimeoutResolver | null,
) {
    _resolveTimeout = resolver;
}

/** Таймаут, заданный самим вызовом, сильнее общего правила. */
const applyRequestTimeout = (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (config.timeout !== undefined || !_resolveTimeout) return config;
    const timeout = _resolveTimeout({ url: config.url, method: config.method });
    return timeout && timeout > 0 ? { ...config, timeout } : config;
};

/**
 * Orval mutator — all generated API calls go through this function.
 * Unwraps the Nest `{ resultCode, data, message }` envelope.
 */
export const customAxios = async <T>(
    requestConfig: AxiosRequestConfig,
): Promise<T> => {
    const config = applyRequestTimeout(requestConfig);

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
