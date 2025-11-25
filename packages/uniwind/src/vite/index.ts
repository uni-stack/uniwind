import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Plugin } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const componentPath = path.resolve(
    __dirname,
    '../module/components/index.web.js',
)

export const uniwind = (): Plugin => {
    return {
        name: 'uniwind',
        config: () => ({
            resolve: {
                alias: [
                    {
                        find: /^react-native$/,
                        replacement: componentPath,
                        customResolver: {
                            resolveId(_, importer) {
                                // Check if import comes from uniwind
                                if (importer?.includes('node_modules/uniwind') === true) {
                                    return this.resolve('react-native-web')
                                }

                                return componentPath
                            },
                        },
                    },
                ],
            },
        }),
    }
}
