export interface ApiConfig {
    apiKey?: string;
    /**
     * Кто мы: `event-sales`, `event-service`, … Нужен ключам браузерного кэша
     * (`swr-cache`): приложения одного портала живут на общем origin и делят
     * localStorage/IndexedDB. Без этого сегмента два приложения писали бы
     * слепок в одну ячейку — ровно та неявная связь, которой страдал
     * легаси-ключ `portal_cache_<дата>`.
     */
    appId?: string;
}

let config: ApiConfig = {};

export const setConfig = (newConfig: ApiConfig) => {
    config = { ...config, ...newConfig };
};

export const getConfig = () => config;

export const getApiHeaders = () => ({
    'content-type': 'application/json',
    accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-API-KEY': config.apiKey || '',
});
