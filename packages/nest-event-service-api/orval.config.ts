// packages/nest-event-service-api/orval.config.ts
// Бэкенд: back/apps/event-service (defaultPort 3006, swagger /docs/api).
// Для генерации бэкенд должен быть запущен: `pnpm dev:event-service` в back/.
const baseurl = `http://localhost:3006/docs/api-json`;
// const baseurl = `https://api.event-service.april-app.ru/docs/api-json`; // prod URL — TBD
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
                    path: './src/lib/event-service-api.ts',
                    name: 'customAxios',
                },
            },
        },
    },
};
