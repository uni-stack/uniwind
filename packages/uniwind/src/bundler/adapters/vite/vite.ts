import { normalizePath } from '@tailwindcss/node'
import path from 'path'
import type { Plugin } from 'vite'

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

export const uniwind = (config: UniwindConfig): Plugin => {
    const bundlerConfig = UniwindBundlerConfig.fromViteConfig(config)

    return {
        name: 'uniwind',
        enforce: 'pre',
        resolveId: (source, importer) => {
            const normalizedSource = normalizePath(source)
            const isTarget = source === './createOrderedCSSStyleSheet'
                || normalizedSource.endsWith('react-native-web/dist/exports/StyleSheet/dom/createOrderedCSSStyleSheet.js')

            if (isTarget && importer !== undefined && normalizePath(importer).includes('react-native-web/dist/exports/StyleSheet')) {
                return styleSheetPath
            }
        },
        config: () => ({
            css: {
                transformer: 'lightningcss',
                lightningcss: {
                    visitor: bundlerConfig.cssVisitor,
                },
            },
            optimizeDeps: {
                exclude: ['uniwind', 'react-native'],
                esbuildOptions: {
                    plugins: [{
                        name: 'uniwind-esbuild-plugin',
                        setup: build => {
                            build.onResolve(
                                { filter: /^\.\/createOrderedCSSStyleSheet$/ },
                                args => {
                                    if (normalizePath(args.importer).includes('react-native-web/dist/exports/StyleSheet')) {
                                        return { path: styleSheetPath }
                                    }
                                },
                            )
                        },
                    }],
                },
            },
            resolve: {
                alias: [
                    {
                        find: /^react-native$/,
                        replacement: componentPath,
                        customResolver: {
                            resolveId(_, importer) {
                                // Check if import comes from uniwind
                                if (importer !== undefined && normalizePath(importer).includes('uniwind/dist')) {
                                    return this.resolve('react-native-web')
                                }

                                return componentPath
                            },
                        },
                    },
                ],
            },
        }),
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
