import { UniwindBundlerConfig } from '@/bundler/config'
import type { UniwindConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import type { MetroConfig } from 'metro-config'
import type { CustomResolver } from 'metro-resolver'
import { join } from 'node:path'
import { cacheStore, patchMetroGraphToSupportUncachedModules } from './patches'
import { nativeResolver, webResolver } from './resolvers'

const isUniwindRequest = (moduleName: string) => moduleName === 'uniwind' || moduleName.startsWith('uniwind/')

export const withUniwindConfig = <T extends MetroConfig>(
    config: T,
    uniwindConfig: UniwindConfig,
): T => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig(uniwindConfig)
    const pinnedUniwindOrigin = join(config.projectRoot ?? process.cwd(), 'package.json')

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
                const baseResolver = config.resolver?.resolveRequest ?? context.resolveRequest
                const resolver: CustomResolver = (nextContext, nextModuleName, nextPlatform) => {
                    if (isUniwindRequest(nextModuleName)) {
                        return baseResolver(
                            {
                                ...nextContext,
                                originModulePath: pinnedUniwindOrigin,
                            },
                            nextModuleName,
                            nextPlatform,
                        )
                    }

                    return baseResolver(nextContext, nextModuleName, nextPlatform)
                }
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
