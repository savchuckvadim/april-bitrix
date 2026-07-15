// packages/nest-event-sales-api/orval.config.ts
// Бэкенд: back/apps/event-sales (defaultPort 3005, swagger /docs/api).
// Для генерации бэкенд должен быть запущен: `pnpm dev:event-sales` в back/.
const baseurl = `http://localhost:3000/docs/api-json`;
// const baseurl = `https://api.event-sales.april-app.ru/docs/api-json`; // prod URL — TBD
export default {
    api: {
        input: baseurl,
        output: {
            target: 'src/generated/api.ts',
            client: 'axios',
            prettier: true,
            mode: 'tags-split',
            schemas: 'src/generated/model',

            override: {
                mutator: {
                    path: './src/lib/event-sales-api.ts',
                    name: 'customAxios',
                },
            },
        },
    },
};
