import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // юнит-тесты репозиториев/сервисов на фейках BitrixBaseApi —
        // браузерная среда не нужна
        environment: 'node',
        include: ['src/**/*.{test,spec}.ts'],
    },
});
