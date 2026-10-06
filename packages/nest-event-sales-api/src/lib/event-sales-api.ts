import axios, { AxiosRequestConfig } from 'axios';

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
