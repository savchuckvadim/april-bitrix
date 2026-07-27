// packages/nest-kpi-report-sales-api/orval.config.ts
// Бэкенд: back/apps/kpi-report-sales (swagger /docs/api, json /docs/api-json).
// Для генерации бэкенд должен быть запущен: `npm run dev:kpi-report-sales` в back/.
const baseurl = `http://localhost:3001/docs/api-json`;
// const baseurl = `https://api.kpi-sales.april-app.ru/docs/api-json`; // prod URL (порт 8223 в ports.env)
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
                    path: './src/lib/kpi-report-sales-api.ts',
                    name: 'customAxios',
                },
            },
        },
    },
};
