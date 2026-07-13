// packages/nest-api/orval.config.ts
// input: 'https://api.install.april-app.ru/docs/api-json',
const baseurl = `http://localhost:3000/docs/api-json`;
// const baseurl = `https://api.install.april-app.ru/docs/api-json`;
export default {
    api: {
        input: baseurl,
        output: {
            target: 'src/generated/api.ts',
            client: 'axios', // или 'react-query'
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
