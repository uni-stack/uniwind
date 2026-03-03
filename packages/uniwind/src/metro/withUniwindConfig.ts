import type { MetroConfig } from 'metro-config'
import { Platform } from '../common/consts'
import { cacheStore, patchMetroGraphToSupportUncachedModules } from './metro-css-patches'
import { nativeResolver, webResolver } from './resolvers'
import { UniwindConfig } from './types'
import { uniq } from './utils'

export const withUniwindConfig = <T extends MetroConfig>(
    config: T,
    uniwindConfig: UniwindConfig,
): T => {
    uniwindConfig.themes = uniq([
        'light',
        'dark',
        ...(uniwindConfig.extraThemes ?? []),
    ])

    patchMetroGraphToSupportUncachedModules()

    if (typeof uniwindConfig === 'undefined') {
        throw new Error('Uniwind: You need to pass second parameter to withUniwindConfig')
    }

    if (typeof uniwindConfig.cssEntryFile === 'undefined') {
        throw new Error(
            'Uniwind: You need to pass css css entry file to withUniwindConfig, e.g. withUniwindConfig(config, { cssEntryFile: "./global.css" })',
        )
    }

    return {
        ...config,
        cacheStores: [cacheStore],
        transformerPath: require.resolve('./metro-transformer.cjs'),
        transformer: {
            ...config.transformer,
            uniwind: uniwindConfig,
        },
        resolver: {
            ...config.resolver,
            sourceExts: [
                ...config.resolver?.sourceExts ?? [],
                'css',
            ],
            assetExts: config.resolver?.assetExts?.filter(
                ext => ext !== 'css',
            ),
            resolveRequest: (context, moduleName, platform) => {
                const resolver = config.resolver?.resolveRequest ?? context.resolveRequest
                const platformResolver = platform === Platform.Web ? webResolver : nativeResolver
                const resolved = platformResolver({
                    context,
                    moduleName,
                    platform,
                    resolver,
                })

                return resolved
            },
        },
    }
}
