// packages/nest-api/src/lib/back-api.ts
import axios, { AxiosRequestConfig, Method } from 'axios';


const prod = `https://back.april-app.ru/`;
// const prod = `http://localhost:8089/`;
// const prod = `https://back.april-dev.ru/`;
// const url = prod;

// console.log('url back-api nest-api-packages', url);

export interface IBackResponse<T> {
    resultCode: EResultCode; // 0 - успех, 1 - ошибка
    data?: T; // данные ответа (при успехе)
    message?: string; // сообщение ошибки (при ошибке)
    errors?: string[]; // ошибки (при ошибке)
}
export enum EResultCode {
    SUCCESS = 0,
    ERROR = 1,
}

const $apiHeaders = {
    'content-type': 'application/json',
    'X-BACK-API-KEY': '',
    'X-Admin-Ts': '',
    'X-Admin-Token': '',
};

const $api = axios.create({
    baseURL: prod,
    withCredentials: true,
    headers: $apiHeaders,
});

export function setAiAdminAuthHeaders({
    ts,
    token,
}: {
    ts?: string;
    token?: string;
}) {
    const resolvedTs = ts ?? '';
    const resolvedToken = token ?? '';

    $api.defaults.headers.common['X-Admin-Ts'] = resolvedTs;
    $api.defaults.headers.common['X-Admin-Token'] = resolvedToken;
}
// // 🔐 автоматически добавляем JWT
// evs.interceptors.request.use((config) => {
//     const token = localStorage.getItem(AUTH_TOKEN_NAME);
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });


// export const customAxios = async <T>({
//     url,
//     method,
//     data,
//     params,
//     headers,
// }: {
//     url: string;
//     method: Method;
//     data?: any;
//     params?: any;
//     headers?: any;
// }): Promise<T> => {
//     // // Orval всегда ждёт, что mutator возвращает **данные**, а не { resultCode, data }
//     // const res = await backAPI.service<T>(url as EBACK_ENDPOINT, method.toLowerCase() as API_METHOD, data, params);
//     // return res.data as T; // важно вернуть именно T

//     // const instance = axios.create({
//     //     baseURL: 'http://localhost:3000', // или prod
//     //     headers: { 'Content-Type': 'application/json', ...headers },
//     // });

//     const res = await evs.request<IBackResponse<T>>({
//         url,
//         method: method as Method,
//         data,
//         params, // 🔹 вот здесь axios сам превращает объект в query string
//         headers,
//     });
//     if (res.data.resultCode !== EResultCode.SUCCESS) {
//         throw new Error(res.data.message || `Backend error ${url}`);
//     }
//
//     return res.data.data as T;
// };
export const customAxios = async <T>(
    config: AxiosRequestConfig
): Promise<T> => {
    // blob / arraybuffer — сразу возвращаем
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
