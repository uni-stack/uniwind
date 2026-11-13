import { Platform } from 'react-native'

const reactNativeVersion = Platform.constants?.reactNativeVersion

export const isReactNativeAtLeast = (minor: number) => (reactNativeVersion?.major ?? 0) > 0 || (reactNativeVersion?.minor ?? 0) >= minor
