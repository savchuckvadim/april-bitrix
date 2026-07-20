// packages/nest-admin-api/orval.config.ts
// Бэкенд: back/apps/admin (defaultPort 3004, swagger UI /docs/api, JSON /docs/api-json).
// Для генерации бэкенд должен быть запущен: `pnpm dev:admin` в back/.
// Бэку нужна docker-инфраструктура (Redis, ClickHouse, БД) — без неё bootstrap
// не доходит до listen(), и генерация молча ждёт несуществующий сервер.
// Порт берётся из корневого back/.env (PORT), а не из apps/admin/.env — сверьте
// по строке «🚀 admin запущен» в логе, прежде чем менять baseurl ниже.
//
// Генерировать ТОЛЬКО с живого сервера. Офлайн-дамп схемы через
// NestFactory.create выглядит рабочим, но теряет enum-типы у DTO, чьи константы
// приходят циклическим импортом: 2026-07-20 так выродились в string
// ContractDto.code, OfferTemplateDto.visibility и OfferTemplateSummaryDto —
// с живого сервера те же файлы генерируются корректно.
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
