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

// prod URL — TBD (домен для back/apps/admin ещё не заведён)
let _baseURL = 'http://localhost:3000/';
// let _baseURL = 'https://api.admin.april-app.ru/';
export function configureBaseURL(url: string) {
    _baseURL = url;
    $api.defaults.baseURL = url;
}

export const $api = axios.create({
    baseURL: _baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    // Зависший бэкенд (например, SMTP без таймаута при выпуске кода) не
    // должен выглядеть как вечный pending: по таймауту axios бросает
    // ошибку, UI показывает её и разблокирует кнопку. Ретраев здесь НЕТ
    // намеренно — POST-ы не идемпотентны (повтор выпуска кода = дубль).
    timeout: 30_000,
});

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
