/** @type {import('next').NextConfig} */

// Не роняем сборку — предупреждаем: dev без переменных должен подниматься.
for (const envVar of ['LOG_FILE_PATH']) {
    if (!process.env[envVar]) {
        console.warn(`[kpi-sales] Missing environment variable: ${envVar}`);
    }
}

const nextConfig = {
    transpilePackages: [
        '@workspace/ui',
        '@workspace/april-ui',
        '@workspace/theme',
        '@workspace/bitrix',
        '@workspace/bx',
        '@workspace/pbx',
        '@workspace/ws',
        '@workspace/nest-kpi-report-sales-api',
    ],
};

export default nextConfig;
