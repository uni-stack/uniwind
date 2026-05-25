import { fileURLToPath } from 'node:url'
import { BuildConfig, defineBuildConfig } from 'unbuild'

type Config = {
    input: string
    outDir: string
    pattern?: Array<string>
    declaration?: boolean
}

const srcPath = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

const getConfig = (config: Config) =>
    [
        {
            builder: 'mkdist',
            input: config.input,
            outDir: `dist/common/${config.outDir}`,
            ext: 'js',
            format: 'cjs',
            pattern: config.pattern,
            esbuild: {
                jsx: 'automatic',
                jsxImportSource: 'react',
            },
        },
        {
            builder: 'mkdist',
            input: config.input,
            outDir: `dist/module/${config.outDir}`,
            ext: 'js',
            format: 'esm',
            pattern: config.pattern,
            declaration: config.declaration,
            esbuild: {
                jsx: 'automatic',
                jsxImportSource: 'react',
            },
        },
    ] satisfies Array<BuildConfig['entries'][number]>

export default defineBuildConfig({
    entries: [
        {
            builder: 'rollup',
            input: './src/bundler/adapters/metro',
            name: 'metro/index',
        },
        {
            builder: 'rollup',
            input: './src/bundler/adapters/metro/transformer.ts',
            name: 'metro/transformer',
        },
        {
            builder: 'mkdist',
            input: './src/bundler/adapters/metro',
            outDir: 'dist/metro',
            pattern: ['index.d.ts'],
            declaration: true,
            format: 'esm',
        },
        {
            builder: 'rollup',
            input: './src/bundler/adapters/vite',
            name: 'vite/index',
        },
        {
            builder: 'rollup',
            input: './src/bundler/cli/index.ts',
            name: 'cli/index',
        },
        {
            builder: 'mkdist',
            input: './src/bundler/adapters/vite',
            outDir: 'dist/vite',
            pattern: ['index.d.ts'],
            declaration: true,
            format: 'esm',
        },
        {
            builder: 'copy',
            input: '../../',
            outDir: './',
            pattern: ['LICENSE', 'readme.md'],
        },
        ...getConfig({
            input: './src/components',
            outDir: 'components',
        }),
        ...getConfig({
            input: './src',
            outDir: '',
            pattern: [
                '**/*',
                '!metro/**',
                '!bundler/adapters/metro/**',
                '!bundler/adapters/vite/**',
            ],
            declaration: true,
        }),
    ],
    alias: {
        '@/common': srcPath('common'),
        '@/bundler': srcPath('bundler'),
    },
    outDir: 'dist',
    clean: true,
    externals: [
        /@tailwindcss/,
        'lightningcss',
        /metro-cache/,
        /metro\/private/,
    ],
    rollup: {
        emitCJS: true,
    },
    dependencies: [
        '@tailwindcss',
    ],
})
