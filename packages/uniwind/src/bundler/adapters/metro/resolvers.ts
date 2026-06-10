import type { UniwindBundlerConfig } from '@/bundler/config'
import type { CustomResolutionContext, CustomResolver } from 'metro-resolver'
import { basename, dirname, sep } from 'node:path'

type ResolverConfig = {
    platform: string | null
    resolver: CustomResolver
    context: CustomResolutionContext
    moduleName: string
    bundlerConfig: UniwindBundlerConfig
}

let cachedInternalBasePath: string | null = null

const SUPPORTED_COMPONENTS = [
    'ActivityIndicator',
    'Button',
    'FlatList',
    'Image',
    'ImageBackground',
    'InputAccessoryView',
    'KeyboardAvoidingView',
    'Modal',
    'Pressable',
    'RefreshControl',
    'SafeAreaView',
    'ScrollView',
    'SectionList',
    'Switch',
    'Text',
    'TextInput',
    'TouchableHighlight',
    'TouchableNativeFeedback',
    'TouchableOpacity',
    'TouchableWithoutFeedback',
    'View',
    'VirtualizedList',
    'createOrderedCSSStyleSheet',
]

const EXPO_UI_MODULES: Record<string, string> = {
    '@expo/ui': 'uniwind/expo-ui',
    '@expo/ui/swift-ui': 'uniwind/expo-ui/swift-ui',
    '@expo/ui/jetpack-compose': 'uniwind/expo-ui/jetpack-compose',
}

export const nativeResolver = ({
    context,
    moduleName,
    platform,
    resolver,
    bundlerConfig,
}: ResolverConfig) => {
    const resolution = resolver(context, moduleName, platform)

    if (cachedInternalBasePath === null) {
        try {
            cachedInternalBasePath = dirname(require.resolve('uniwind/package.json'))
        } catch {
            cachedInternalBasePath = ''
        }
    }

    const isInternal = cachedInternalBasePath !== '' && context.originModulePath.startsWith(cachedInternalBasePath)
    const isFromNodeModules = context.originModulePath.includes(`${sep}node_modules${sep}`)
    const isFromReactNative = context.originModulePath.includes(`${sep}react-native${sep}`)
        || context.originModulePath.includes(`${sep}@react-native${sep}`)
    const isReactNativeAnimated = context.originModulePath.includes(`${sep}Animated${sep}components${sep}`)

    if (
        isInternal // Is from uniwind
        || resolution.type !== 'sourceFile' // Is not a source file
        || (isFromReactNative && isFromNodeModules && !isReactNativeAnimated) // Is from react-native but not Animated
    ) {
        return resolution
    }

    const expoUIReplacement = EXPO_UI_MODULES[moduleName]

    if (bundlerConfig.thirdPartyModules.expoUI && expoUIReplacement !== undefined) {
        return resolver(context, expoUIReplacement, platform)
    }

    if (moduleName === 'react-native') {
        return resolver(context, 'uniwind/components', platform)
    }

    if (
        resolution.filePath.includes(`${sep}react-native${sep}Libraries${sep}`)
    ) {
        const filename = basename(resolution.filePath.split(sep).at(-1) ?? '')
        const module = filename.split('.').at(0)

        if (module !== undefined && SUPPORTED_COMPONENTS.includes(module)) {
            return resolver(context, `uniwind/components/${module}`, platform)
        }
    }

    return resolution
}

export const webResolver = ({
    context,
    moduleName,
    platform,
    resolver,
    bundlerConfig,
}: ResolverConfig) => {
    const resolution = resolver(context, moduleName, platform)

    if (cachedInternalBasePath === null) {
        try {
            cachedInternalBasePath = dirname(require.resolve('uniwind/package.json'))
        } catch {
            cachedInternalBasePath = ''
        }
    }

    const isInternal = cachedInternalBasePath !== '' && context.originModulePath.startsWith(cachedInternalBasePath)

    const expoUIReplacement = EXPO_UI_MODULES[moduleName]

    if (!isInternal && bundlerConfig.thirdPartyModules.expoUI && expoUIReplacement !== undefined) {
        return resolver(context, expoUIReplacement, platform)
    }

    if (
        isInternal
        || resolution.type !== 'sourceFile'
        || !resolution.filePath.includes(`${sep}react-native-web${sep}`)
    ) {
        return resolution
    }

    const segments = resolution.filePath.split(sep)
    const filename = segments.at(-1) ?? ''
    const isIndex = filename.startsWith('index.')
    const module = segments.at(-2)

    // Handle createOrderedCSSStyleSheet which is in StyleSheet/dom/ subdirectory
    if (filename.startsWith('createOrderedCSSStyleSheet.')) {
        return resolver(context, `uniwind/components/createOrderedCSSStyleSheet`, platform)
    }

    if (!isIndex || module === undefined || !SUPPORTED_COMPONENTS.includes(module) || context.originModulePath.endsWith(`${module}${sep}index.js`)) {
        return resolution
    }

    return resolver(context, `uniwind/components/${module}`, platform)
}
