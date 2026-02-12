export default {
    preset: 'react-native',
    displayName: 'native',
    testMatch: ['<rootDir>/tests/native/**/*.test.{ts,tsx}'],
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/tests/setup.native.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)',
    ],
    moduleNameMapper: {
        '^react-native$': '<rootDir>/../../node_modules/react-native',
    },
}
