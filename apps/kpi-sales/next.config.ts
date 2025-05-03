import type { NextConfig } from 'next'

// Проверяем наличие обязательных переменных окружения
const requiredEnvVars = [
    'ONLINE_API_KEY',

    'LOG_FILE_PATH',
   
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const nextConfig: NextConfig = {
    env: {
        ONLINE_API_KEY: process.env.ONLINE_API_KEY,
        LOG_FILE_PATH: process.env.LOG_FILE_PATH,
    },
    // Добавляем поддержку TypeScript для конфигурации
    typescript: {
        // Включаем проверку типов при сборке
        ignoreBuildErrors: false,
    },
    // Настройки для монорепозитория
    transpilePackages: ['@workspace/api', '@workspace/ui'],
}

export default nextConfig 