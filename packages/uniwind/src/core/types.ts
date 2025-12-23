import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native'
import { ColorScheme, Orientation, StyleDependency, UniwindConfig } from '../types'

export type Style = {
    entries: Array<[string, () => unknown]>
    minWidth: number
    maxWidth: number
    orientation: Orientation | null
    theme: ColorScheme | null
    rtl: boolean | null
    native: boolean
    dependencies: Array<StyleDependency> | null
    index: number
    className: string
    importantProperties: Array<string>
    complexity: number
    active: boolean | null
    focus: boolean | null
    disabled: boolean | null
}

export type StyleSheets = Record<string, Array<Style>>

export type GenerateStyleSheetsCallback = (rt: UniwindRuntime) => {
    stylesheet: StyleSheets
    vars: Record<string, unknown>
    scopedVars: Partial<Record<string, Record<string, unknown>>>
}

type UserThemes = UniwindConfig extends { themes: infer T extends readonly string[] } ? T
    : readonly string[]

export type ThemeName = UserThemes[number]

export type UniwindRuntime = {
    screen: {
        width: number
        height: number
    }
    orientation: Orientation
    colorScheme: ColorScheme
    currentThemeName: ThemeName
    rtl: boolean
    insets: {
        top: number
        bottom: number
        left: number
        right: number
    }
    hairlineWidth: number
    pixelRatio: (value: number) => number
    fontScale: (value: number) => number
    colorMix: (color: string, weight: number | string, mixColor: string) => string
    cubicBezier: (x1: number, y1: number, x2: number, y2: number) => string
    lightDark: (light: string, dark: string) => string
}

export type RNStyle = ViewStyle & TextStyle & ImageStyle & {
    accentColor?: string
    fill?: string
}

export type RNStylesProps =
    | 'style'
    | 'contentContainerStyle'
    | 'imageStyle'
    | 'ListFooterComponentStyle'
    | 'ListHeaderComponentStyle'
    | 'columnWrapperStyle'
export type RNClassNameProps = GetClassName<RNStylesProps>

type GetClassName<T extends string> = T extends `${infer S}Style` ? `${S}ClassName` : 'className'

export type UniwindComponentProps =
    & {
        [K in RNStylesProps]?: StyleProp<RNStyle>
    }
    & {
        [K in RNClassNameProps]?: string
    }

declare global {
    var __uniwindThemes__: ReadonlyArray<string> | undefined
}

export type ComponentState = {
    isPressed?: boolean
    isDisabled?: boolean
    isFocused?: boolean
}

export type CSSVariables = Record<string, string | number>
