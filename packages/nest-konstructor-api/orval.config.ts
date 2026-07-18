// packages/nest-konstructor-api/orval.config.ts
// Бэкенд: back/apps/konstructor (defaultPort 3007, swagger UI /docs/api, JSON /docs/api-json).
// Для генерации бэкенд должен быть запущен: `pnpm dev:konstructor` в back/.
const baseurl = `http://localhost:3000/docs/api-json`;
// const baseurl = `https://api.konstructor.april-app.ru/docs/api-json`; // prod URL — TBD
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
                    path: './src/lib/konstructor-api.ts',
                    name: 'customAxios',
                },
            },
        },
    },
};
