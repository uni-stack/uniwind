import { Appearance, Dimensions, I18nManager, PixelRatio, StyleSheet } from 'react-native'
import { ColorScheme, Orientation } from '../../types'
import type { UniwindRuntime as UniwindRuntimeType } from '../types'
import { colorMix, lightDark, parseColor } from './native-utils'

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
    insets: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    colorMix,
    pixelRatio: value => value * PixelRatio.get(),
    cubicBezier: () => '',
    lightDark: () => '',
    parseColor,
} as UniwindRuntimeType

UniwindRuntime.lightDark = lightDark.bind(UniwindRuntime)
