// packages/nest-api/orval.config.ts
export default {
    api: {
        input: 'http://localhost:3000/docs/api-json',
        output: {
            target: 'src/generated/api.ts',
            client: 'axios', // или 'react-query'
            prettier: true,
            mode: 'tags-split',
            schemas: 'src/generated/model',

            override: {
                mutator: {
                    path: './src/lib/back-api.ts',
                    name: 'customAxios',
                },
            },

        },
    },
};
