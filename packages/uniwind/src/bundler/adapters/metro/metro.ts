import { UniwindBundlerConfig } from '@/bundler/config'
import type { UniwindMetroConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import type { MetroConfig } from 'metro-config'
import type { CustomResolver } from 'metro-resolver'
import { dirname, join } from 'node:path'
import { RAW_COMPONENTS_MODULE } from './constants'
import { cacheStore, patchMetroGraphToSupportUncachedModules } from './patches'
import { nativeResolver, webResolver } from './resolvers'

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
    uniwindConfig: UniwindMetroConfig,
): T => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig(uniwindConfig)
    const pinnedUniwindOrigin = join(config.projectRoot ?? process.cwd(), 'package.json')
    const optimizeClasslessComponents = uniwindConfig.experimental?.optimizeClasslessComponents === true
    const rawComponentsPath = optimizeClasslessComponents
        ? join(
            dirname(require.resolve('uniwind/package.json')),
            'src/bundler/adapters/metro/raw-components.ts',
        )
        : undefined

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
                    if (nextModuleName === RAW_COMPONENTS_MODULE && rawComponentsPath) {
                        return {
                            type: 'sourceFile',
                            filePath: rawComponentsPath,
                        }
                    }

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
