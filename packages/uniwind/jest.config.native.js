import { fileURLToPath } from 'node:url'

const native = {
    preset: '@react-native/jest-preset',
    displayName: 'native',
    testMatch: ['<rootDir>/tests/native/**/*.test.{ts,tsx}'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.node.ts', '@testing-library/jest-native/extend-expect', '<rootDir>/tests/setup.native.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)',
    ],
    moduleNameMapper: {
        '^react-native$': '<rootDir>/../../node_modules/react-native',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^\\./transformer\\.cjs$': '<rootDir>/src/bundler/adapters/metro/transformer.ts',
    },
}

export default {
    projects: [
        native,
        // Apps can compile uniwind with React Compiler (e.g. a workspace-linked copy), so run the suite against compiled src too
        {
            ...native,
            displayName: 'native-react-compiler',
            transform: {
                '^.+\\.(js|ts|tsx)$': ['babel-jest', {
                    overrides: [{
                        test: fileURLToPath(new URL('src', import.meta.url)),
                        plugins: ['babel-plugin-react-compiler'],
                    }],
                }],
            },
        },
    ],
}
