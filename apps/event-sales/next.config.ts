import type { NextConfig } from 'next';

// Проверяем наличие обязательных переменных окружения
const requiredEnvVars = [
    'ONLINE_API_KEY',
    'IN_BITRIX',
    'LOG_FILE_PATH',
    'PDF_PREVIEW_URL',
    'PORT',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// В проде приложение живёт под префиксом на next.april-app.ru/sales
// (см. deploy/nginx/next.april-app.ru.conf): в корне того же домена стоит
// kpi-sales, поэтому отрезать префикс на прокси нельзя — Next должен сам
// знать про basePath и отдавать /sales/_next/*.
//
// В dev (`next dev`) basePath пустой — localhost:3000 работает как раньше,
// без префикса. Сменить префикс можно через NEXT_PUBLIC_BASE_PATH на сборке;
// чтобы убрать его совсем (переезд на свой поддомен) — правится DEFAULT_BASE_PATH.
const DEFAULT_BASE_PATH = process.env.NODE_ENV === 'production' ? '/sales' : '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || DEFAULT_BASE_PATH;

const nextConfig: NextConfig = {
    basePath: basePath || undefined,
    env: {
        ONLINE_API_KEY: process.env.ONLINE_API_KEY,
        LOG_FILE_PATH: process.env.LOG_FILE_PATH,
        IN_BITRIX: process.env.IN_BITRIX,
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
    // Добавляем поддержку TypeScript для конфигурации
    typescript: {
        // Включаем проверку типов при сборке
        ignoreBuildErrors: false,
    },
    // Настройки для монорепозитория
    transpilePackages: ['@workspace/api', '@workspace/ui', '@workspace/april-ui', '@workspace/bitrix', '@workspace/bx', '@workspace/pbx', '@workspace/nest-api', '@workspace/nest-event-sales-api'],
};

export default nextConfig;
