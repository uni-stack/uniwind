import { CustomResolutionContext, CustomResolver } from 'metro-resolver'
import { basename, dirname, sep } from 'node:path'

type ResolverConfig = {
    platform: string | null
    resolver: CustomResolver
    context: CustomResolutionContext
    moduleName: string
}

let cachedComponentsBasePath: string | null = null

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
]

export const nativeResolver = ({
    context,
    moduleName,
    platform,
    resolver,
}: ResolverConfig) => {
    const resolution = resolver(context, moduleName, platform)

    if (cachedComponentsBasePath === null) {
        const componentsResolution = resolver(context, 'uniwind/components', platform)

        cachedComponentsBasePath = componentsResolution.type === 'sourceFile'
            ? dirname(componentsResolution.filePath)
            : ''
    }

    const isInternal = cachedComponentsBasePath !== '' && context.originModulePath.startsWith(cachedComponentsBasePath)
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

    if (moduleName === 'react-native') {
        return resolver(context, `uniwind/components`, platform)
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
}: ResolverConfig) => {
    const resolution = resolver(context, moduleName, platform)

    if (cachedComponentsBasePath === null) {
        const componentsResolution = resolver(context, 'uniwind/components', platform)

        cachedComponentsBasePath = componentsResolution.type === 'sourceFile'
            ? dirname(componentsResolution.filePath)
            : ''
    }
    if (
        (cachedComponentsBasePath !== '' && context.originModulePath.startsWith(cachedComponentsBasePath))
        || resolution.type !== 'sourceFile'
        || !resolution.filePath.includes(`${sep}react-native-web${sep}`)
    ) {
        return resolution
    }

    const segments = resolution.filePath.split(sep)
    const isIndex = segments.at(-1)?.startsWith('index.')
    const module = segments.at(-2)

    if (!isIndex || module === undefined || !SUPPORTED_COMPONENTS.includes(module) || context.originModulePath.endsWith(`${module}${sep}index.js`)) {
        return resolution
    }

    return resolver(context, `uniwind/components/${module}`, platform)
}
