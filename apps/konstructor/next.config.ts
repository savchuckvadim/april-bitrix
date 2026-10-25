import type { NextConfig } from 'next';

// Проверяем наличие обязательных переменных окружения
const requiredEnvVars = [
    'IN_BITRIX',
    'LOG_FILE_PATH',
    'PORT',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const nextConfig: NextConfig = {
    env: {
        LOG_FILE_PATH: process.env.LOG_FILE_PATH,
        IN_BITRIX: process.env.IN_BITRIX,
    },
    // Добавляем поддержку TypeScript для конфигурации
    typescript: {
        // Включаем проверку типов при сборке
        ignoreBuildErrors: false,
    },
    // Настройки для монорепозитория
    transpilePackages: [
        '@workspace/api',
        '@workspace/ui',
        '@workspace/april-ui',
        '@workspace/theme',
        '@workspace/bitrix',
        '@workspace/bx',
        '@workspace/pbx',
        '@workspace/pbx-data',
        '@workspace/nest-konstructor-api',
    ],
};

export default nextConfig;
