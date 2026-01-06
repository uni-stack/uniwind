import { CustomResolutionContext, CustomResolver } from 'metro-resolver'
import { basename, resolve, sep } from 'node:path'
import { name } from '../../package.json'

type ResolverConfig = {
    platform: string | null
    resolver: CustomResolver
    context: CustomResolutionContext
    moduleName: string
}

const thisModuleDist = resolve(__dirname, '../../dist')
const thisModuleSrc = resolve(__dirname, '../../src')

const isFromThisModule = (filename: string) => filename.startsWith(thisModuleDist) || filename.startsWith(thisModuleSrc)

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
    const isInternal = isFromThisModule(context.originModulePath)
    const isFromReactNative = context.originModulePath.includes(`${sep}react-native${sep}`)
        || context.originModulePath.includes(`${sep}@react-native${sep}`)

    if (isInternal || resolution.type !== 'sourceFile' || isFromReactNative) {
        return resolution
    }

    if (moduleName === 'react-native') {
        return resolver(context, `${name}/components`, platform)
    }

    if (
        resolution.filePath.includes(`${sep}react-native${sep}Libraries${sep}`)
    ) {
        const filename = basename(resolution.filePath.split(sep).at(-1) ?? '')
        const module = filename.split('.').at(0)

        if (module !== undefined && SUPPORTED_COMPONENTS.includes(module)) {
            return resolver(context, `${name}/components/${module}`, platform)
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

    if (
        isFromThisModule(context.originModulePath)
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

    return resolver(context, `${name}/components/${module}`, platform)
}
