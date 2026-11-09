import { formatHex, formatHex8, interpolate, parse } from 'culori'
import type { CSSVariables, ThemeName, Var, Vars } from '../types'

const scopedVarsCache = new WeakMap<CSSVariables, Vars>()

// Normalizes a fixed CSS variable value once, on its first read.
export const createVarGetter = (value: string | number): Var => {
    let initialized = false
    let normalizedValue: unknown

    return () => {
        if (!initialized) {
            normalizedValue = value

            if (typeof value === 'string') {
                const parsedColor = parse(value)

                if (parsedColor) {
                    normalizedValue = parsedColor.alpha === undefined || parsedColor.alpha === 1
                        ? formatHex(parsedColor)
                        : formatHex8(parsedColor)
                }
            }

            initialized = true
        }

        return normalizedValue
    }
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

export const colorMix = (color: string, weight: number | string, mixColor: string) => {
    const parsedWeight = typeof weight === 'string'
        ? parseFloat(weight) / 100
        : weight

    // Change alpha
    if (mixColor === '#00000000') {
        const parsedColor = parse(color)

        if (parsedColor === undefined) {
            return color
        }

        return formatHex8({
            ...parsedColor,
            alpha: parsedWeight * (parsedColor.alpha ?? 1),
        })
    }

    return formatHex(interpolate([mixColor, color])(parsedWeight))
}

export function lightDark(light: string, dark: string, themeName: ThemeName) {
    if (themeName === 'dark') {
        return dark
    }

    return light
}

export const parseColor = (type: string, color: string) => {
    try {
        const parsedColor = parse(`${type}(${color})`)

        if (parsedColor === undefined) {
            return color
        }

        if (parsedColor.alpha === 1 || parsedColor.alpha === undefined) {
            return formatHex(parsedColor)
        }

        return formatHex8(parsedColor)
    } catch {
        return '#000000'
    }
}
