import { BuildConfig, defineBuildConfig } from 'unbuild'

type Config = {
    input: string
    outDir: string
    pattern?: Array<string>
    declaration?: boolean
}

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
            input: './src/metro',
            name: 'metro/index',
        },
        {
            builder: 'rollup',
            input: './src/metro/metro-transformer.ts',
            name: 'metro/metro-transformer',
        },
        {
            builder: 'mkdist',
            input: './src/metro',
            outDir: 'dist/metro',
            pattern: ['index.d.ts'],
            declaration: true,
            format: 'esm',
        },
        {
            builder: 'rollup',
            input: './src/vite',
            name: 'vite/index',
        },
        {
            builder: 'mkdist',
            input: './src/vite',
            outDir: 'dist/vite',
            pattern: ['index.d.ts'],
            declaration: true,
            format: 'esm',
        },
        {
            builder: 'copy',
            input: '../../',
            outDir: './',
            pattern: ['LICENSE'],
        },
        {
            builder: 'copy',
            input: '../../assets',
            outDir: './assets',
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
            ],
            declaration: true,
        }),
    ],
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
