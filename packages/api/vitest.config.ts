import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // хранилища браузера подменяются подделками — среда jsdom не нужна
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
});
