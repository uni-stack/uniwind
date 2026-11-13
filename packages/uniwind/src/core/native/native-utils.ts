import { Appearance, Platform } from 'react-native'
import { ColorScheme, Platform as UniwindPlatform } from '../../common/consts'
import { parseColorText, toHexColor } from '../../uniparser/src/common/color'
import { isReactNativeAtLeast } from '../reactNativeVersion'
import type { CSSVariables, UniwindRuntime, Var, Vars } from '../types'

const scopedVarsCache = new WeakMap<CSSVariables, Vars>()

// Normalizes a CSS variable value (numbers pass through, colors -> hex) and wraps it in a lazy getter
export const createVarGetter = (value: string | number): Var => () => {
    if (typeof value === 'number') {
        return value
    }

    const parsedColor = parseColorText(value)

    return parsedColor === undefined ? value : toHexColor(parsedColor)
}

export const getScopedVars = (variables: CSSVariables): Vars => {
    const cachedVars = scopedVarsCache.get(variables)

    if (cachedVars) {
        return cachedVars
    }

    const vars = Object.fromEntries(
        Object.entries(variables)
            .map(([name, value]) => [name, createVarGetter(value)]),
    ) as Vars

    scopedVarsCache.set(variables, vars)

    return vars
}

export function lightDark(this: UniwindRuntime, light: string, dark: string) {
    if (this.currentThemeName === 'dark') {
        return dark
    }

    return light
}

// css-cascade-5 inherit: the variable below the class's own declaration (theme, ScopedVariables or root), evaluated in that scope
export const readInheritedVariable = (vars: Vars, name: string) => {
    let owner: Vars | null = vars

    while (owner !== null && !Object.hasOwn(owner, name)) {
        owner = Object.getPrototypeOf(owner) as Vars | null
    }

    const parent = owner === null ? null : Object.getPrototypeOf(owner) as Vars | null

    return parent === null ? undefined : parent[name]?.(parent)
}

// React Native reads a fallback from 0.88, Android below it drops a color object with one
const takesPlatformColorFallback = isReactNativeAtLeast(88)

export const platformColor = (iosNames: Array<string>, androidNames: Array<string>, fallback?: string) => {
    const isIOS = Platform.OS === UniwindPlatform.iOS
    const names = isIOS ? iosNames : Platform.OS === UniwindPlatform.Android ? androidNames : []

    if (names.length === 0) {
        return fallback
    }

    // Android resolves a resource when the prop changes, so the color carries the appearance it was resolved in
    const color = isIOS
        ? { semantic: names }
        : { resource_paths: names, uniwindColorScheme: [Appearance.getColorScheme() ?? ColorScheme.Light] }

    return fallback !== undefined && takesPlatformColorFallback ? { ...color, fallback } : color
}
