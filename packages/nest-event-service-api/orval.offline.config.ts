/**
 * Офлайн-вариант orval-конфига: input — файл схемы, снятый скриптом
 * back/scripts/dump-openapi.ts (бэк запускать не нужно, Redis/БД не нужны).
 *
 * Использование (из корня back):
 *   npx ts-node -T -r tsconfig-paths/register scripts/dump-openapi.ts event-service event-service-openapi.json
 * затем из этой папки:
 *   npx orval --config orval.offline.config.ts
 */
export default {
    api: {
        input: '../../../back/event-service-openapi.json',
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
