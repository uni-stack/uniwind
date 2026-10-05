import path from 'node:path'
import { createServer, type Plugin, type UserConfig } from 'vite'
import { describe, expect, test, vi } from 'vitest'

import { uniwind } from '@/bundler/adapters/vite/vite'
import type { UniwindConfig } from '@/bundler/types'

const config: UniwindConfig = {
    cssEntryFile: './tests/test.css',
}

const getPluginConfig = async (plugin: Plugin) => {
    const hook = plugin.config

    if (hook === undefined) {
        throw new Error('Expected the Uniwind plugin to define a config hook')
    }

    const handler = typeof hook === 'function' ? hook : hook.handler

    return await Reflect.apply(handler, {}, [
        {},
        {
            command: 'build',
            mode: 'test',
            isSsrBuild: false,
            isPreview: false,
        },
    ]) as UserConfig
}

const getReactNativeAlias = async (plugin: Plugin) => {
    const pluginConfig = await getPluginConfig(plugin)
    const aliases = pluginConfig.resolve?.alias

    if (!Array.isArray(aliases)) {
        throw new TypeError('Expected the Uniwind plugin to define aliases as an array')
    }

    const alias = aliases[0]

    if (alias === undefined || typeof alias === 'string') {
        throw new TypeError('Expected the Uniwind plugin to define a React Native alias')
    }

    return alias
}

const runResolveId = async (
    plugin: Plugin,
    context: { resolve: ReturnType<typeof vi.fn> },
    source: string,
    importer: string | undefined,
) => {
    const hook = plugin.resolveId

    if (hook === undefined) {
        throw new Error('Expected the Uniwind plugin to define a resolveId hook')
    }

    const handler = typeof hook === 'function' ? hook : hook.handler

    return await Reflect.apply(handler, context, [source, importer])
}

describe('Vite adapter', () => {
    test('avoids the deprecated customResolver with Vite 8', async () => {
        const plugin = uniwind(config)
        const alias = await getReactNativeAlias(plugin)

        expect(alias).not.toHaveProperty('customResolver')
    })

    test('resolves Uniwind internal React Native imports through React Native Web with Vite 8', async () => {
        const plugin = uniwind(config)
        const alias = await getReactNativeAlias(plugin)
        const importer = path.resolve('node_modules/uniwind/dist/module/components/web/View.js').replaceAll('/', '\\')
        const source = alias.replacement.replaceAll('/', '\\')
        const resolved = { id: path.resolve('node_modules/react-native-web/index.js') }
        const resolve = vi.fn().mockResolvedValue(resolved)

        await expect(runResolveId(plugin, { resolve }, source, importer)).resolves.toBe(resolved)
        expect(resolve).toHaveBeenCalledWith('react-native-web', importer, { skipSelf: true })
    })

    test('resolves an internal React Native import through the Vite plugin pipeline', async () => {
        const plugin = uniwind(config)

        plugin.buildStart = undefined
        plugin.generateBundle = undefined

        const server = await createServer({
            configFile: false,
            logLevel: 'silent',
            plugins: [plugin],
            server: { middlewareMode: true },
        })

        try {
            const importer = path.resolve('node_modules/uniwind/dist/module/components/web/View.js')
            const resolved = await server.pluginContainer.resolveId('react-native', importer)
            const expected = await server.pluginContainer.resolveId('react-native-web', importer)

            expect(expected?.id).toBeDefined()
            expect(resolved?.id).toBe(expected?.id)
        } finally {
            await server.close()
        }
    })

    test('leaves application React Native imports on the Uniwind component alias', async () => {
        const plugin = uniwind(config)
        const alias = await getReactNativeAlias(plugin)
        const resolve = vi.fn()

        await expect(runResolveId(
            plugin,
            { resolve },
            alias.replacement,
            path.resolve('src/App.tsx'),
        )).resolves.toBeUndefined()
        expect(resolve).not.toHaveBeenCalled()
    })

    test.each(
        [
            ['has no importer', undefined, 'component'],
            ['does not target the component alias', 'internal', 'react-native'],
        ] as const,
    )('does not delegate when the import %s', async (_case, importerType, sourceType) => {
        const plugin = uniwind(config)
        const alias = await getReactNativeAlias(plugin)
        const importer = importerType === 'internal'
            ? path.resolve('node_modules/uniwind/dist/module/components/web/View.js')
            : undefined
        const source = sourceType === 'component' ? alias.replacement : sourceType
        const resolve = vi.fn()

        await expect(runResolveId(plugin, { resolve }, source, importer)).resolves.toBeUndefined()
        expect(resolve).not.toHaveBeenCalled()
    })

    test('preserves ordered stylesheet resolution before React Native Web delegation', async () => {
        const plugin = uniwind(config)
        const importer = path.resolve(
            'node_modules/react-native-web/dist/exports/StyleSheet/index.js',
        )
        const resolve = vi.fn()

        const resolved = await runResolveId(
            plugin,
            { resolve },
            './createOrderedCSSStyleSheet',
            importer,
        )

        expect(resolved).toBe(path.resolve(
            'src/bundler/adapters/module/components/web/createOrderedCSSStyleSheet.js',
        ))
        expect(resolve).not.toHaveBeenCalled()
    })
})
