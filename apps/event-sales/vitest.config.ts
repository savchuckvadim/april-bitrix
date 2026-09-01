import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@workspace/ui': path.resolve(__dirname, '../../packages/ui/src'),
            '@': path.resolve(__dirname, '.'),
        },
    },
    test: {
        environment: 'node',
        // `app/**` — серверная часть (реестр метрик, route-хелперы): она
        // тоже заслуживает тестов, а жила вне прогона.
        include: ['modules/**/*.test.ts', 'app/**/*.test.ts'],
        server: {
            deps: {
                // workspace-пакеты — сырые TS-исходники, vitest должен их
                // транспилить (матчим и имя пакета, и реальный путь симлинка)
                inline: [/@workspace\//, /packages[\\/][^\\/]+[\\/]src/],
            },
        },
    },
});
