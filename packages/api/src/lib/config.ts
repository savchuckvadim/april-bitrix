export interface ApiConfig {
    apiKey?: string;
}

let config: ApiConfig = {};

export const setConfig = (newConfig: ApiConfig) => {
    config = { ...config, ...newConfig };
};

export const getConfig = () => config;

export const getApiHeaders = () => ({
    'content-type': 'application/json',
    'accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-API-KEY': config.apiKey || '',
}); 