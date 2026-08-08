/**
 * Офлайн-вариант orval-конфига: input — файл схемы, снятый скриптом
 * back/scripts/dump-openapi.ts (бэк запускать не нужно).
 *
 * Использование (из этой папки):
 *   npx ts-node ../../..../back/scripts/dump-openapi.ts pbx-install schema.json
 *   npx orval --config orval.offline.config.ts
 */
export default {
    api: {
        input: '../../../back/pbx-install-openapi.json',
        output: {
            target: 'src/generated/api.ts',
            client: 'axios',
            prettier: true,
            mode: 'tags-split',
            schemas: 'src/generated/model',

            override: {
                mutator: {
                    path: './src/lib/pbx-install-api.ts',
                    name: 'customAxios',
                },
            },
        },
    },
};
