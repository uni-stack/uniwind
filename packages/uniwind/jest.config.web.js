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
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native-web)/)',
    ],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: './tsconfig.test.json',
        }],
    },
}
