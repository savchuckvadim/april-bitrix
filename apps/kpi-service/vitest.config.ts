import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@workspace/nest-api': path.resolve(
                __dirname,
                '../../packages/nest-api',
            ),
            '@workspace/ui': path.resolve(__dirname, '../../packages/ui/src'),
            '@': path.resolve(__dirname, '.'),
        },
    },
    test: {
        environment: 'node',
        include: ['modules/**/*.test.ts'],
        server: {
            deps: {
                // workspace-пакеты — сырые TS-исходники, vitest должен их
                // транспилить (матчим и имя пакета, и реальный путь симлинка)
                inline: [/@workspace\//, /packages[\\/][^\\/]+[\\/]src/],
            },
        },
    },
});
