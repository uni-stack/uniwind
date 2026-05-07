import { UniwindBundlerConfig } from '@/bundler/config'
import { compileCSS } from '@/bundler/css-compiler'
import type { UniwindMetroConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import type * as ExpoMetroConfig from '@expo/metro-config'
import type * as MetroTransformWorker from 'metro-transform-worker'
import type { JsTransformerConfig, JsTransformOptions } from 'metro-transform-worker'
import path from 'path'

const cssArtifactPath = path.resolve(__dirname, '../../uniwind.css')

let worker: typeof MetroTransformWorker

try {
    try {
        const { unstable_transformerPath } = require('@expo/metro-config') as typeof ExpoMetroConfig

        worker = require(unstable_transformerPath)
    } catch {
        worker = require('@expo/metro-config/build/transform-worker/transform-worker.js')
    }
} catch {
    worker = require('metro-transform-worker')
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

    await bundlerConfig.generateArtifacts(cssArtifactPath)
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
