import { normalizePath } from '@tailwindcss/node'
import path from 'path'
import type { Plugin } from 'vite'
import { buildCSS } from '../css'
import { processFunctions } from '../css/processFunctions'
import { uniq } from '../metro/utils'
import { buildDtsFile } from '../utils/buildDtsFile'
import { stringifyThemes } from '../utils/stringifyThemes'

type UniwindConfig = {
    cssEntryFile: string
    extraThemes?: Array<string>
    dtsFile?: string
}

const componentPath = path.resolve(
    import.meta.dirname,
    '../module/components/index.web.js',
)

export const uniwind = ({
    cssEntryFile,
    extraThemes,
    dtsFile = 'uniwind-types.d.ts',
}: UniwindConfig): Plugin => {
    const themes = uniq([
        'light',
        'dark',
        ...(extraThemes ?? []),
    ])
    const stringifiedThemes = stringifyThemes(themes)

    return {
        name: 'uniwind',
        config: () => ({
            css: {
                transformer: 'lightningcss',
                lightningcss: {
                    visitor: {
                        Function: processFunctions,
                    },
                },
            },
            optimizeDeps: {
                exclude: ['uniwind', 'react-native'],
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
        transformIndexHtml: (html) => {
            return {
                html,
                tags: [
                    {
                        tag: 'script',
                        attrs: { type: 'module' },
                        injectTo: 'head',
                        children: `globalThis.__uniwindThemes__ = ${stringifiedThemes}`,
                    },
                ],
            }
        },
        buildStart: async () => {
            await buildCSS(themes, cssEntryFile)
            buildDtsFile(dtsFile, stringifiedThemes)
        },
        generateBundle: async () => {
            await buildCSS(themes, cssEntryFile)
            buildDtsFile(dtsFile, stringifiedThemes)
        },
    }
}
