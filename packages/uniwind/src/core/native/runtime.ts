import { Appearance, Dimensions, I18nManager, PixelRatio, StyleSheet } from 'react-native'
import { cubicBezier, linear, steps } from 'react-native-reanimated'
import { initialWindowMetrics } from 'react-native-safe-area-context'
import { ColorScheme, Orientation } from '../../types'
import type { UniwindRuntime as UniwindRuntimeType } from '../types'
import { colorMix, lightDark } from './native-utils'

const window = Dimensions.get('window')
const initialColorScheme = Appearance.getColorScheme() ?? ColorScheme.Light

export const UniwindRuntime = {
    screen: {
        width: window.width,
        height: window.height,
    },
    colorScheme: initialColorScheme,
    currentThemeName: initialColorScheme,
    orientation: window.width > window.height ? Orientation.Landscape : Orientation.Portrait,
    fontScale: value => value * PixelRatio.getFontScale(),
    hairlineWidth: StyleSheet.hairlineWidth,
    rtl: I18nManager.isRTL,
    insets: initialWindowMetrics?.insets ?? { top: 0, left: 0, bottom: 0, right: 0 },
    colorMix,
    pixelRatio: value => value * PixelRatio.get(),
    cubicBezier,
    steps,
    linear,
    lightDark: () => '',
} as UniwindRuntimeType

UniwindRuntime.lightDark = lightDark.bind(UniwindRuntime)
