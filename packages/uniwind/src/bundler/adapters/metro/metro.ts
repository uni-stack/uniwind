import { resolve } from 'node:path'

import { UniwindBundlerConfig } from '@/bundler/config'
import { Platform } from '@/common/consts'

import { cacheStore, patchMetroGraphToSupportUncachedModules } from './patches'
import { nativeResolver, webResolver } from './resolvers'

import type { UniwindConfig } from '@/bundler/types'
import type { MetroConfig } from 'metro-config'
import type { CustomResolver } from 'metro-resolver'

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
            sourceExts: [...(config.resolver?.sourceExts ?? []), 'css'],
            assetExts: config.resolver?.assetExts?.filter((ext) => ext !== 'css'),
            resolveRequest: (context, moduleName, platform) => {
                const baseResolver = config.resolver?.resolveRequest ?? context.resolveRequest
                // Pin every `uniwind` specifier to a single physical copy. In monorepos
                // (bun/pnpm) uniwind can be installed as multiple peer-hash copies; mixing
                // them both crashes Hermes ("Maximum call stack size exceeded" via
                // get NativeModules recursion, when the react-native shim redirects across
                // copies) and splits uniwind's theme runtime across instances (no styling,
                // colorKit "invalid" color errors). Resolving every `uniwind` request from
                // a single origin (the project root) collapses them to one instance.
                // Wrapping `resolver` — not just this resolveRequest — ensures the platform
                // resolvers' internal `react-native` -> `uniwind/components` redirects are
                // pinned too.
                const pinnedOrigin = resolve(config.projectRoot ?? process.cwd(), 'index.js')
                const resolver: CustomResolver = (ctx, name, plat) =>
                    name.split('/')[0] === 'uniwind' && ctx.originModulePath !== pinnedOrigin
                        ? baseResolver({ ...ctx, originModulePath: pinnedOrigin }, name, plat)
                        : baseResolver(ctx, name, plat)
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
