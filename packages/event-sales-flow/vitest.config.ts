import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // чистое ядро — браузерная среда не нужна
        environment: 'node',
        // тела спек 1:1 с jest-версиями бэка: describe/it/expect/vi — глобалы
        globals: true,
        include: ['src/**/*.{test,spec}.ts'],
    },
});
