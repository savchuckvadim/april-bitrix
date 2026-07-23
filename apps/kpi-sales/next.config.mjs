/** @type {import('next').NextConfig} */

// ONLINE_API_KEY нужен proxy-роутам (/api/proxy/*) до полного ухода с online API (этап 5 рефакторинга).
// Не роняем сборку — предупреждаем: dev без ключа должен подниматься.
for (const envVar of ['ONLINE_API_KEY', 'LOG_FILE_PATH']) {
    if (!process.env[envVar]) {
        console.warn(`[kpi-sales] Missing environment variable: ${envVar}`);
    }
}

const nextConfig = {
    transpilePackages: [
        '@workspace/api',
        '@workspace/ui',
        '@workspace/april-ui',
        '@workspace/theme',
        '@workspace/bitrix',
        '@workspace/bx',
        '@workspace/pbx',
        '@workspace/ws',
        '@workspace/nest-api',
        '@workspace/nest-pbx-api',
        '@workspace/nest-kpi-report-sales-api',
    ],
};

export default nextConfig;
