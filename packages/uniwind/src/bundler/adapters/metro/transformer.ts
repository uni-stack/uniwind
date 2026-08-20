import { UniwindBundlerConfig } from '@/bundler/config'
import { compileCSS } from '@/bundler/css-compiler'
import type { UniwindMetroConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import type * as ExpoMetroConfig from '@expo/metro-config'
import type * as MetroTransformWorker from 'metro-transform-worker'
import type { JsTransformerConfig, JsTransformOptions } from 'metro-transform-worker'
import path from 'path'
import {
    TRANSFORM_COMPONENTS,
    UPSTREAM_BABEL_TRANSFORMER,
} from './constants'

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

export const shouldTransformClasslessComponents = (
    config: Pick<UniwindMetroConfig, 'experimental'>,
    data: Buffer,
    options: Pick<JsTransformOptions, 'platform' | 'type'>,
) => config.experimental?.optimizeClasslessComponents === true
    && options.type !== 'asset'
    && options.platform !== Platform.Web
    && data.includes('react-native')

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
        const shouldTransformComponents = shouldTransformClasslessComponents(
            config.uniwind,
            data,
            options,
        )

        if (!shouldTransformComponents) {
            return worker.transform(config, projectRoot, filePath, data, options)
        }

        return worker.transform(
            {
                ...config,
                babelTransformerPath: require.resolve('./babel-transformer.cjs'),
            },
            projectRoot,
            filePath,
            data,
            {
                ...options,
                customTransformOptions: {
                    ...options.customTransformOptions,
                    [TRANSFORM_COMPONENTS]: true,
                    [UPSTREAM_BABEL_TRANSFORMER]: config.babelTransformerPath,
                },
            },
        )
    }

    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig(config.uniwind, options.platform)
    await bundlerConfig.generateArtifacts(cssArtifactPath)
    const virtualCode = await compileCSS(bundlerConfig)
    const isWeb = bundlerConfig.platform === Platform.Web

    data = Buffer.from(
        isWeb
            ? virtualCode
            : [
                `const { Uniwind } = require('uniwind');`,
                `Uniwind.__reinit(rt => ${virtualCode}, ${bundlerConfig.stringifiedThemes});`,
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
