import { UniwindBundlerConfig } from '@/bundler/config'
import type { UniwindConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import type { MetroConfig } from 'metro-config'
import { cacheStore, patchMetroGraphToSupportUncachedModules } from './patches'
import { nativeResolver, webResolver } from './resolvers'

export const withUniwindConfig = <T extends MetroConfig>(
    config: T,
    uniwindConfig: UniwindConfig,
): T => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig(uniwindConfig)
    patchMetroGraphToSupportUncachedModules()

    return {
        ...config,
        cacheStores: [cacheStore],
        transformerPath: require.resolve('./transformer.cjs'),
        transformer: {
            ...config.transformer,
            uniwind: bundlerConfig.toMetroConfig(),
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
