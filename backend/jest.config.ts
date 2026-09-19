import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                // Relax strict settings so ts-jest is fast in tests
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
            },
        }],
    },
    // Collect coverage from source files (not test files)
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/__tests__/**',
        '!src/index.ts',     // Express app wiring — tested via supertest
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    // Force exit after tests complete — prevents open handle warnings from async timers
    forceExit: true,
    // Make tests self-contained — never connect to real AWS/DynamoDB
    setupFiles: ['<rootDir>/src/__tests__/jestSetup.ts'],
    clearMocks: true,
    restoreMocks: true,
};

export default config;
