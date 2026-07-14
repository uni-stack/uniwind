import { normalizePath } from '@tailwindcss/node'
import { createRequire } from 'node:module'
import path from 'path'
import type { PluginContext } from 'rollup'
import type { Plugin, UserConfig } from 'vite'

import { UniwindBundlerConfig } from '@/bundler/config'
import type { UniwindConfig } from '@/bundler/types'

const dirname = typeof __dirname !== 'undefined' ? __dirname : import.meta.dirname
const componentPath = path.resolve(
    dirname,
    '../module/components/web/index.js',
)
const styleSheetPath = path.resolve(
    dirname,
    '../module/components/web/createOrderedCSSStyleSheet.js',
)
const cssArtifactPath = path.resolve(dirname, '../../uniwind.css')
const require = createRequire(import.meta.url)
const viteVersion = require('vite/package.json').version as string

const isVite8 = Number(viteVersion.split('.')[0]) >= 8

type EsbuildResolveArgs = {
    path: string
    importer: string
}

type EsbuildBuild = {
    onResolve: (
        options: { filter: RegExp },
        callback: (args: EsbuildResolveArgs) => { path: string } | undefined,
    ) => void
}

const resolveOrderedCSSStyleSheet = (source: string, importer: string | undefined) => {
    const normalizedSource = normalizePath(source)
    const isTarget = source === './createOrderedCSSStyleSheet'
        || normalizedSource.endsWith('react-native-web/dist/exports/StyleSheet/dom/createOrderedCSSStyleSheet.js')

    if (isTarget && importer !== undefined && normalizePath(importer).includes('react-native-web/dist/exports/StyleSheet')) {
        return styleSheetPath
    }
}

const vite8OptimizeDeps = {
    include: ['react-native-web'],
    exclude: ['uniwind', 'react-native'],
    rolldownOptions: {
        plugins: [{
            name: 'uniwind-rolldown-plugin',
            resolveId: resolveOrderedCSSStyleSheet,
        }],
    },
}

const vite7OptimizeDeps = {
    exclude: ['uniwind', 'react-native'],
    esbuildOptions: {
        plugins: [{
            name: 'uniwind-esbuild-plugin',
            setup: (build: EsbuildBuild) => {
                build.onResolve(
                    { filter: /^\.\/createOrderedCSSStyleSheet$/ },
                    args => {
                        const resolved = resolveOrderedCSSStyleSheet(args.path, args.importer)

                        if (resolved !== undefined) {
                            return { path: resolved }
                        }
                    },
                )
            },
        }],
    },
}

const vite8Resolve = {
    alias: [{
        find: /^react-native$/,
        replacement: componentPath,
        customResolver: {
            resolveId(this: PluginContext, _: string, importer: string | undefined) {
                if (importer !== undefined && normalizePath(importer).includes('uniwind/dist')) {
                    return this.resolve('react-native-web', importer, { skipSelf: true })
                }

                return componentPath
            },
        },
    }],
}

const vite7Resolve = {
    alias: [{
        find: /^react-native$/,
        replacement: componentPath,
        customResolver: {
            resolveId(this: PluginContext, _: string, importer: string | undefined) {
                // Check if import comes from uniwind
                if (importer !== undefined && normalizePath(importer).includes('uniwind/dist')) {
                    return this.resolve('react-native-web')
                }

                return componentPath
            },
        },
    }],
}

export const uniwind = (config: UniwindConfig): Plugin => {
    const bundlerConfig = UniwindBundlerConfig.fromViteConfig(config)

    return {
        name: 'uniwind',
        enforce: 'pre',
        resolveId: (source, importer) => {
            return resolveOrderedCSSStyleSheet(source, importer)
        },
        config: () =>
            ({
                css: {
                    transformer: 'lightningcss',
                    lightningcss: {
                        visitor: bundlerConfig.cssVisitor,
                    },
                },
                optimizeDeps: isVite8 ? vite8OptimizeDeps : vite7OptimizeDeps,
                resolve: isVite8 ? vite8Resolve : vite7Resolve,
            }) as unknown as UserConfig,
        transform: (code, id) => {
            const normalizedId = normalizePath(id)

            if (normalizedId.includes('uniwind/dist') && normalizedId.includes('config/config.js')) {
                return {
                    code: `${code}\n;Uniwind.__reinit(() => ({}), ${bundlerConfig.stringifiedThemes})`,
                }
            }
        },
        buildStart: async () => {
            await bundlerConfig.generateArtifacts(cssArtifactPath)
        },
        generateBundle: async () => {
            await bundlerConfig.generateArtifacts(cssArtifactPath)
        },
    }
}
