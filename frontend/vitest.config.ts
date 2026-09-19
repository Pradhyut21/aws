import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
        exclude: ['node_modules', 'dist'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/__tests__/**',
                'src/main.tsx',
                'src/test/**',
            ],
            thresholds: {
                lines:      60,
                functions:  60,
                branches:   50,
                statements: 60,
            },
        },
    },
});
