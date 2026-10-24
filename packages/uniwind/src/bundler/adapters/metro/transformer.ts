import { UniwindBundlerConfig } from '@/bundler/config'
import { compileCSS } from '@/bundler/css-compiler'
import type { UniwindMetroConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import type * as ExpoMetroConfig from '@expo/metro-config'
import fs from 'fs'
import type * as MetroTransformWorker from 'metro-transform-worker'
import type { JsTransformerConfig, JsTransformOptions } from 'metro-transform-worker'
import { createHash } from 'node:crypto'
import path from 'path'

const cssArtifactPath = path.resolve(__dirname, '../../uniwind.css')

// Local stylesheets a development entry requires, so editing one re-runs its transform. When uniwind is linked
// (a workspace package, `npm link`), `@import 'uniwind'` resolves to the generated artifact outside node_modules.
// Requiring it would rebuild the entry after each write, and Metro servers with different themes after each other's.
export const isImportedStylesheet = (stylesheet: string, artifactPath: string) =>
    stylesheet.endsWith('.css')
    && !stylesheet.includes(`${path.sep}node_modules${path.sep}`)
    && fs.realpathSync(stylesheet) !== fs.realpathSync(artifactPath)

// Cache workers separately for Expo (`true`) and plain Metro (`false`) configs.
const workerCache = new Map<boolean, typeof MetroTransformWorker>()

const getTransformWorker = (isExpoProject?: boolean): typeof MetroTransformWorker => {
    const cacheKey = Boolean(isExpoProject)
    const cachedWorker = workerCache.get(cacheKey)

    if (cachedWorker) {
        return cachedWorker
    }

    const resolvedWorker: typeof MetroTransformWorker = cacheKey
        ? (() => {
            try {
                const { unstable_transformerPath } = require('@expo/metro-config') as typeof ExpoMetroConfig

                return require(unstable_transformerPath)
            } catch {
                return require('@expo/metro-config/build/transform-worker/transform-worker.js')
            }
        })()
        : require('metro-transform-worker')

    workerCache.set(cacheKey, resolvedWorker)

    return resolvedWorker
}

export const transform = async (
    config: JsTransformerConfig & {
        uniwind: UniwindMetroConfig
    },
    projectRoot: string,
    filePath: string,
    data: Buffer,
    options: JsTransformOptions,
) => {
    const worker = getTransformWorker(config.uniwind.isExpoProject)
    const isCss = options.type !== 'asset' && path.join(process.cwd(), config.uniwind.cssEntryFile) === path.join(projectRoot, filePath)

    if (filePath.endsWith('/components/web/metro-injected.js')) {
        const bundlerConfig = UniwindBundlerConfig.fromMetroConfig(config.uniwind, Platform.Web)

        data = Buffer.from(
            [
                `import { Uniwind } from 'uniwind';`,
                `Uniwind.__reinit(() => ({}), ${bundlerConfig.stringifiedThemes});`,
            ].join(''),
            'utf-8',
        )
    }

    if (!isCss) {
        if (!config.uniwind.isExpoProject && options.platform !== Platform.Web && options.type !== 'asset' && filePath.endsWith('.css')) {
            // Plain Metro parses CSS as JavaScript; these modules only register watched files.
            return worker.transform(config, projectRoot, `${filePath}.js`, Buffer.from(''), options)
        }

        return worker.transform(config, projectRoot, filePath, data, options)
    }

    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig(config.uniwind, options.platform)
    await bundlerConfig.generateArtifacts(cssArtifactPath)
    const isWeb = bundlerConfig.platform === Platform.Web
    const importedStylesheets = new Set<string>()
    const virtualCode = await compileCSS(bundlerConfig, dependency => {
        if (!isWeb && options.dev && isImportedStylesheet(dependency, cssArtifactPath)) {
            importedStylesheets.add(dependency)
        }
    })
    const importedStylesheetRequires = Array.from(importedStylesheets).sort().map(stylesheet => {
        const relativePath = path.relative(path.dirname(bundlerConfig.cssPath), stylesheet).split(path.sep).join('/')

        return `require(${JSON.stringify(relativePath.startsWith('../') ? relativePath : `./${relativePath}`)});`
    })
    const nativeStylesFingerprint = isWeb
        ? undefined
        : createHash('sha256')
            .update(virtualCode)
            .update('\0')
            .update(bundlerConfig.stringifiedThemes)
            .digest('hex')

    data = Buffer.from(
        isWeb
            ? virtualCode
            : [
                ...importedStylesheetRequires,
                `const { Uniwind } = require('uniwind');`,
                `Uniwind.__reinit(rt => ${virtualCode}, ${bundlerConfig.stringifiedThemes}, '${nativeStylesFingerprint}');`,
            ].join(''),
        'utf-8',
    )

    // Expo reconciles optimized modules by graph path, where this module is still a .css file.
    // Transform native CSS as regular JS so its require is rewritten and the module is wrapped.
    const transformOptions = config.uniwind.isExpoProject && !isWeb
        ? {
            ...options,
            customTransformOptions: {
                ...options.customTransformOptions,
                optimize: 'false',
            },
        }
        : options

    const transform: any = await worker.transform(
        config,
        projectRoot,
        `${filePath}${isWeb ? '' : '.js'}`,
        data,
        transformOptions,
    )

    transform.output[0].data.css ??= {}
    transform.output[0].data.css.skipCache = true

    if (!isWeb) {
        transform.output[0].data.css.code = ''
    }

    return transform
}
