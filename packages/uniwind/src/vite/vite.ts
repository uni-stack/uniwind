import { normalizePath } from '@tailwindcss/node'
import path from 'path'
import type { Plugin } from 'vite'
import { name as UNIWIND_PACKAGE_NAME } from '../../package.json'
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

const dirname = typeof __dirname !== 'undefined' ? __dirname : import.meta.dirname
const componentPath = path.resolve(
    dirname,
    '../module/components/web/index.js',
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
                exclude: [UNIWIND_PACKAGE_NAME, 'react-native'],
            },
            resolve: {
                alias: [
                    {
                        find: /^react-native$/,
                        replacement: componentPath,
                        customResolver: {
                            resolveId(_, importer) {
                                // Check if import comes from uniwind
                                if (importer !== undefined && normalizePath(importer).includes(`${UNIWIND_PACKAGE_NAME}/dist`)) {
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

            if (normalizedId.includes(`${UNIWIND_PACKAGE_NAME}/dist`) && normalizedId.includes('config/config.js')) {
                return {
                    code: `${code}Uniwind.__reinit(() => ({}), ${stringifiedThemes})`,
                }
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
