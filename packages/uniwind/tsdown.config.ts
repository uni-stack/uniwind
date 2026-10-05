import { defineConfig, type UserConfig } from 'tsdown'

export default defineConfig([
    {
        entry: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.d.ts', '!src/bundler/**'],
        root: 'src',
        format: ['esm', 'cjs'],
        platform: 'neutral',
        fixedExtension: true,
        unbundle: true,
        deps: { neverBundle: [/^react-native-web(?:\/|$)/] },
        treeshake: false,
        cjsDefault: false,
        dts: true,
    },
    ...Object.entries({
        'metro/index': 'src/bundler/adapters/metro/index.ts',
        'metro/transformer': 'src/bundler/adapters/metro/transformer.ts',
        'vite/index': 'src/bundler/adapters/vite/index.ts',
        'cli/index': 'src/bundler/cli/index.ts',
    }).map(([name, input]) => ({
        entry: { [name]: input },
        format: name === 'cli/index' ? ['esm'] : ['cjs', 'esm'],
        dts: false,
        shims: true,
        copy: name === 'metro/index'
            ? [
                { from: ['../../LICENSE', '../../readme.md'], to: '.' },
                { from: 'src/bundler/adapters/metro/index.d.ts', to: 'dist/metro', rename: 'index.d.cts' },
                { from: 'src/bundler/adapters/vite/index.d.ts', to: 'dist/vite', rename: 'index.d.mts' },
                { from: 'src/bundler/adapters/vite/index.d.ts', to: 'dist/vite', rename: 'index.d.cts' },
            ]
            : [],
    } satisfies UserConfig)),
])
