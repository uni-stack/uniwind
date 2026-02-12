export default {
    displayName: 'web',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/tests/web/**/*.test.{ts,tsx}'],
    setupFilesAfterEnv: [
        '@testing-library/jest-dom',
        '<rootDir>/tests/setup.web.ts',
    ],
    preset: 'ts-jest',
    moduleNameMapper: {
        '^react-native$': 'react-native-web',
        '\\.css$': '<rootDir>/tests/__mocks__/styleMock.js',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native-web)/)',
    ],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
}
