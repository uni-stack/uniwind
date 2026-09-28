import { UniwindBundlerConfig } from '@/bundler/config'
import type { UniwindConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import type { MetroConfig } from 'metro-config'
import type * as MetroResolverModule from 'metro-resolver'
import type { CustomResolver } from 'metro-resolver'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { cacheStore, patchMetroGraphToIncludeCssInLazyGraphs, patchMetroGraphToSupportUncachedModules } from './patches'
import { isInternalOrigin, nativeResolver, webResolver } from './resolvers'

const isUniwindRequest = (moduleName: string) => moduleName === 'uniwind' || moduleName.startsWith('uniwind/')

const isExpoMetroConfig = (config: MetroConfig) => {
    const transformerPath = config.transformerPath
    const hasExpoTransformerField = Object.keys(config.transformer ?? {}).some(
        key => key.startsWith('expo') || key.startsWith('_expo'),
    )

    return Boolean(
        transformerPath?.includes('@expo/metro-config')
            || hasExpoTransformerField,
    )
}

export const withUniwindConfig = <T extends MetroConfig>(
    config: T,
    uniwindConfig: UniwindConfig,
): T => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig(uniwindConfig)
    const pinnedUniwindOrigin = join(config.projectRoot ?? process.cwd(), 'package.json')
    const { resolve: metroResolve } = createRequire(require.resolve('metro/package.json'))('metro-resolver') as typeof MetroResolverModule

    patchMetroGraphToIncludeCssInLazyGraphs(resolve(process.cwd(), uniwindConfig.cssEntryFile))
    patchMetroGraphToSupportUncachedModules()

    return {
        ...config,
        cacheStores: [cacheStore],
        transformerPath: require.resolve('./transformer.cjs'),
        transformer: {
            ...config.transformer,
            uniwind: bundlerConfig.toMetroConfig(isExpoMetroConfig(config)),
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
                        const pinnedContext = {
                            ...nextContext,
                            originModulePath: pinnedUniwindOrigin,
                        }
                        const resolution = baseResolver(pinnedContext, nextModuleName, nextPlatform)

                        // fix for Expo's autolinking resolver which resolves by package name and lands on another hoisted
                        // uniwind copy when this one is installed under an alias (e.g. pnpm + npm:uniwind-pro)
                        // instead use default metro-resolver resolveRequest
                        if (resolution.type === 'sourceFile' && !isInternalOrigin(resolution.filePath)) {
                            return metroResolve({ ...pinnedContext, resolveRequest: metroResolve }, nextModuleName, nextPlatform)
                        }

                        return resolution
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
