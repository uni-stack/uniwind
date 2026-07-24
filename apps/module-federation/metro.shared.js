const { getDefaultConfig } = require('expo/metro-config')
const { withModuleFederation } = require('@module-federation/metro')
const { withUniwindConfig } = require('uniwind/metro')
const path = require('path')

const REACT_VERSION = require('react/package.json').version
const REACT_NATIVE_VERSION = require('react-native/package.json').version
const UNIWIND_VERSION = require('uniwind/package.json').version

const withRuntimeRequireBridge = (config, federationName) => {
    const getRunModuleStatement = config.serializer.getRunModuleStatement

    return {
        ...config,
        serializer: {
            ...config.serializer,
            getRunModuleStatement: moduleId =>
                [
                    `globalThis[${JSON.stringify(`${federationName}__r`)}] ??= globalThis.__r;`,
                    getRunModuleStatement(moduleId),
                ].join('\n'),
        },
    }
}

const withCrossOriginRequests = config => {
    const enhanceMiddleware = config.server.enhanceMiddleware

    return {
        ...config,
        server: {
            ...config.server,
            enhanceMiddleware: (middleware, metroServer) => {
                const enhancedMiddleware = enhanceMiddleware?.(middleware, metroServer) ?? middleware

                return (request, response, next) => {
                    response.setHeader('Access-Control-Allow-Origin', '*')
                    response.setHeader('Access-Control-Allow-Headers', '*')

                    if (request.method === 'OPTIONS') {
                        response.statusCode = 204
                        response.end()
                        return
                    }

                    return enhancedMiddleware(request, response, next)
                }
            },
        },
    }
}

const withFederationRuntimeResolver = (uniwindConfig, federatedConfig, baseConfig, projectRoot) => {
    const baseResolver = baseConfig.resolver.resolveRequest
    const federationResolver = federatedConfig.resolver.resolveRequest
    const uniwindResolver = uniwindConfig.resolver.resolveRequest
    const federationRuntimeRoot = `${path.join(projectRoot, 'node_modules/.mf-metro')}${path.sep}`
    const uniwindRoot = `${path.dirname(require.resolve('uniwind/package.json'))}${path.sep}`
    const asyncRequire = path.resolve(__dirname, 'expo-federation-async-require.js')
    const disabledHmr = path.resolve(__dirname, 'remote-hmr-disabled.js')
    const resolveWithBaseConfig = (context, moduleName, platform) => {
        if (baseResolver) {
            return baseResolver(context, moduleName, platform)
        }

        return context.resolveRequest(context, moduleName, platform)
    }

    return {
        ...uniwindConfig,
        resolver: {
            ...uniwindConfig.resolver,
            resolveRequest: (context, moduleName, platform) => {
                // Expo 57 does not initialize the prefixed loader that MF wraps,
                // causing `loadBundleAsync is not a function`. Use an adapter
                // that evaluates the bundle and updates MF's module registries.
                if (
                    moduleName === 'mf:async-require'
                ) {
                    return {
                        type: 'sourceFile',
                        filePath: asyncRequire,
                    }
                }

                // MF imports this virtual module only from generated remote
                // entries, not from the host entry. Its implementation also
                // imports a native-only client on web.
                if (
                    moduleName === 'mf:remote-hmr'
                ) {
                    return {
                        type: 'sourceFile',
                        filePath: disabledHmr,
                    }
                }

                if (
                    context.originModulePath.startsWith(uniwindRoot)
                    && (moduleName === 'uniwind' || moduleName.startsWith('uniwind/'))
                ) {
                    return resolveWithBaseConfig(context, moduleName, platform)
                }

                if (context.originModulePath.startsWith(federationRuntimeRoot)) {
                    return federationResolver(context, moduleName, platform)
                }

                return uniwindResolver(context, moduleName, platform)
            },
        },
    }
}

const getSharedDependencies = role => ({
    react: {
        singleton: true,
        eager: role === 'host',
        ...(role === 'remote' ? { import: false } : {}),
        requiredVersion: REACT_VERSION,
        version: REACT_VERSION,
    },
    'react-native': {
        singleton: true,
        eager: role === 'host',
        ...(role === 'remote' ? { import: false } : {}),
        requiredVersion: REACT_NATIVE_VERSION,
        version: REACT_NATIVE_VERSION,
    },
    uniwind: {
        singleton: true,
        eager: role === 'host',
        ...(role === 'remote' ? { import: false } : {}),
        requiredVersion: UNIWIND_VERSION,
        version: UNIWIND_VERSION,
    },
})

const createMetroConfig = ({
    cssEntryFile,
    projectRoot,
    federation,
}) => {
    const workspaceRoot = path.resolve(projectRoot, '../../..')
    const config = getDefaultConfig(projectRoot)

    config.watchFolders = [workspaceRoot]
    config.resolver.nodeModulesPaths = [
        path.join(projectRoot, 'node_modules'),
        path.join(workspaceRoot, 'node_modules'),
    ]

    const federatedConfig = withModuleFederation(
        config,
        {
            ...federation,
            shared: getSharedDependencies(federation.exposes ? 'remote' : 'host'),
        },
    )

    // MF's runtime Babel patch does not currently reach Expo 57's prepended
    // Metro runtime. Capture the active runtime under the prefix its serializer
    // emits so this reproduction can focus on Uniwind's global style state.
    const corsConfig = withCrossOriginRequests(federatedConfig)
    const bridgedConfig = withRuntimeRequireBridge(corsConfig, federation.name)

    // Uniwind must remain the outer wrapper so its resolver delegates to the
    // Module Federation additions rather than replacing them.
    const uniwindConfig = withUniwindConfig(bridgedConfig, {
        cssEntryFile,
    })

    return withFederationRuntimeResolver(uniwindConfig, bridgedConfig, config, projectRoot)
}

module.exports = {
    createMetroConfig,
}
