import { UniwindBundlerConfig } from '@/bundler/config'
import { compileCSS } from '@/bundler/css-compiler'
import type { UniwindMetroConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import type * as ExpoMetroConfig from '@expo/metro-config'
import type * as MetroTransformWorker from 'metro-transform-worker'
import type { JsTransformerConfig, JsTransformOptions } from 'metro-transform-worker'
import { createHash } from 'node:crypto'
import path from 'path'

const cssArtifactPath = path.resolve(__dirname, '../../uniwind.css')

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
        return worker.transform(config, projectRoot, filePath, data, options)
    }

    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig(config.uniwind, options.platform)
    await bundlerConfig.generateArtifacts(cssArtifactPath)
    const virtualCode = await compileCSS(bundlerConfig)
    const isWeb = bundlerConfig.platform === Platform.Web
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
                `const { Uniwind } = require('uniwind');`,
                `Uniwind.__reinit(rt => ${virtualCode}, ${bundlerConfig.stringifiedThemes}, '${nativeStylesFingerprint}');`,
            ].join(''),
        'utf-8',
    )

    const transform: any = await worker.transform(
        config,
        projectRoot,
        `${filePath}${isWeb ? '' : '.js'}`,
        data,
        options,
    )

    transform.output[0].data.css ??= {}
    transform.output[0].data.css.skipCache = true

    if (!isWeb) {
        transform.output[0].data.css.code = ''
    }

    return transform
}
