import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Plugin } from 'vite'
import { processFunctions } from '../css/processFunctions'
import { uniq } from '../metro/utils'
import { buildDtsFile } from '../utils/buildDtsFile'
import { stringifyThemes } from '../utils/stringifyThemes'

type UniwindConfig = {
    extraThemes?: Array<string>
    dtsFile?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const componentPath = path.resolve(
    __dirname,
    '../module/components/index.web.js',
)

const uniwind = ({
    extraThemes,
    dtsFile = 'uniwind-types.d.ts',
}: UniwindConfig = {}): Plugin => {
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
            resolve: {
                alias: [
                    {
                        find: /^react-native$/,
                        replacement: componentPath,
                        customResolver: {
                            resolveId(_, importer) {
                                // Check if import comes from uniwind
                                if (importer?.includes('uniwind/dist') === true) {
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
        buildStart: () => {
            buildDtsFile(dtsFile, stringifiedThemes)
        },
        generateBundle: () => {
            buildDtsFile(dtsFile, stringifiedThemes)
        },
    }
}

export default uniwind
