import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
    resolve: {
        alias: {
            'react-native': 'react-native-web',
            '@': resolve(rootDir, 'src'),
        },
    },
    test: {
        name: 'web',
        environment: 'jsdom',
        include: ['tests/web/**/*.test.{ts,tsx}'],
        setupFiles: ['./tests/setup.web.ts'],
        globals: false,
    },
})
