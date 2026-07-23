import { formatHex, formatHex8, interpolate, parse } from 'culori'
import type { UniwindRuntime, Var } from '../types'

// Normalizes a CSS variable value (numbers pass through, colors -> hex) and wraps it in a lazy getter
export const createVarGetter = (value: string | number): Var => () => {
    if (typeof value === 'number') {
        return value
    }

    const parsedColor = parse(value)

    if (parsedColor) {
        return parsedColor.alpha === undefined || parsedColor.alpha === 1
            ? formatHex(parsedColor)
            : formatHex8(parsedColor)
    }

    return value
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

export function lightDark(this: UniwindRuntime, light: string, dark: string) {
    if (this.currentThemeName === 'dark') {
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
