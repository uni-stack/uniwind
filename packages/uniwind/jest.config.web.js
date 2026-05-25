export default {
    displayName: 'web',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/tests/web/**/*.test.{ts,tsx}'],
    setupFilesAfterEnv: [
        '@testing-library/jest-dom',
        '<rootDir>/tests/setup.web.ts',
    ],
    moduleNameMapper: {
        '^react-native$': 'react-native-web',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native-web)/)',
    ],
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', {
            jsc: {
                parser: {
                    syntax: 'typescript',
                    tsx: true,
                },
                transform: {
                    react: {
                        runtime: 'automatic',
                    },
                },
            },
            module: {
                type: 'commonjs',
            },
        }],
    },
}
