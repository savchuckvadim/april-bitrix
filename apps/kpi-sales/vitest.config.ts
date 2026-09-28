import { defineConfig } from 'vitest/config';
import path from 'node:path';

/** Первые тесты kpi-sales — по образцу apps/admin/vitest.config.ts. */
export default defineConfig({
    // Инлайн-конфиг PostCSS: без него Vite ищет postcss.config.mjs приложения
    // (плагин @tailwindcss/postcss, недоступный в тестах) и валит любой сьют,
    // чей импорт доходит до CSS april-ui (ToneBadge → GlassSurface.css).
    // Стили тестам не нужны — в среде node CSS всё равно не применяется.
    css: { postcss: {} },
    resolve: {
        alias: {
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
