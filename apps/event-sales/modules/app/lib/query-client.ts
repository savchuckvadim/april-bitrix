import { QueryClient } from '@tanstack/react-query';
import { isRetryable } from '@/modules/shared/lib/with-retry';

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
                // Один повтор — и только для быстрых сбоев (сеть моргнула,
                // сервер перезапускается). Запрос, провисевший до таймаута,
                // повторять нельзя: сервер занят, повтор добавит ему работы
                // (то же правило, что у withRetry).
                retry: (failureCount, error) =>
                    failureCount < 1 && isRetryable(error),
            },
        },
    });

let browserClient: QueryClient | undefined;

export const getAppQueryClient = (): QueryClient => {
    if (typeof window === 'undefined') return makeQueryClient();
    browserClient ??= makeQueryClient();
    return browserClient;
};
