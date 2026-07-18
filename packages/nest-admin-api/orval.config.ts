// packages/nest-admin-api/orval.config.ts
// Бэкенд: back/apps/admin (defaultPort 3004, swagger UI /docs/api, JSON /docs/api-json).
// Для генерации бэкенд должен быть запущен: `pnpm dev:admin` в back/.
const baseurl = `http://localhost:3004/docs/api-json`;
// const baseurl = `https://api.admin.april-app.ru/docs/api-json`; // prod URL — TBD
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
                    path: './src/lib/admin-api.ts',
                    name: 'customAxios',
                },
            },
        },
    },
};
