import { QueryClient } from '@tanstack/react-query';

/**
 * Единый QueryClient приложения — листовой модуль, чтобы к кэшу можно было
 * дотянуться и вне React (листенеры стора: например, инвалидация слайса ЗПР
 * на reloadApp). В браузере клиент один на вкладку; на сервере — свежий на
 * каждый вызов, чтобы кэш не утекал между запросами SSR.
 *
 * Дефолты консервативные: фрейм живёт в чужой вкладке, и refetch на каждый
 * фокус окна дёргал бы портал без пользы — свежесть точечно приносят
 * WS-события (`zpr-flow:done`) и явные инвалидации.
 */
const makeQueryClient = (): QueryClient =>
    new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    });

let browserClient: QueryClient | undefined;

export const getAppQueryClient = (): QueryClient => {
    if (typeof window === 'undefined') return makeQueryClient();
    browserClient ??= makeQueryClient();
    return browserClient;
};
