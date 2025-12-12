export default {
    preset: 'react-native',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './tests/setup.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)',
    ],
    moduleNameMapper: {
        '^react-native$': '<rootDir>/../../node_modules/react-native',
    },
}
