import { defineConfig } from 'orval';

export default defineConfig({
    varaus: {
        input: 'http://127.0.0.1:8000/openapi.json',

        output: {
            mode: 'tags-split',
            target: 'src/api/endpoints',
            schemas: 'src/api/models',
            client: 'react-query',
            mock: false,
        },
    },
});
