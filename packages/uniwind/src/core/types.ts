import React from 'react'
import type { ColorValue, ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { ColorScheme, Orientation, StyleDependency } from '../common/consts'
import type { UniwindContext } from './context'

export type Vars = Record<PropertyKey, Var> & {
    __uniwindThemeName?: ThemeName
}
export type Var = (vars: Vars) => unknown

export type Style = {
    entries: Array<[string, Var]>
    matches: (
        rt: UniwindRuntime,
        context: UniwindContextType,
        props: Record<string, any> | undefined,
        state: ComponentState | undefined,
        vars: Vars,
    ) => boolean
    dataAttributeNames: Array<string> | null
    dependencies: Array<StyleDependency> | null
    importantProperties: Array<string>
    complexity: number
    importantComplexity: number
}

export type StyleSheets = Record<string, Array<Style>>

export type GenerateStyleSheetsCallback = (rt: UniwindRuntime) => {
    stylesheet: StyleSheets
    vars: Vars
    scopedVars: Partial<Record<string, Vars>>
}

export interface UniwindConfig {}

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
    lightDark: (light: string, dark: string, themeName: ThemeName) => string
    parseColor: (type: string, color: string) => string
    platformColor: (iosNames: Array<string>, androidNames: Array<string>, fallback?: string) => ColorValue | undefined
}

export type RNStyle = ViewStyle & TextStyle & ImageStyle & {
    accentColor?: string
    fill?: string
    fontVariationSettings?: string
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

export type UniwindContextCSSVariables = CSSVariables & {
    __uniwindVariablesCacheKey?: string
}

export type UniwindContextType = React.ContextType<typeof UniwindContext>
