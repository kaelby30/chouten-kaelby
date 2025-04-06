import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        exclude : ['**/tests/neko-sama.test.ts','**/node_modules/**'],
        environment: 'node',
        coverage: {
            reporter: ['text', 'json', 'html'],
        },
    },
});