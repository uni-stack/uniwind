import { formatHex, formatHex8, interpolate, parse } from 'culori'
import type { UniwindRuntime } from '../types'

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

export const cloneWithAccessors = <T extends object>(obj: T) => {
    const proto = Object.getPrototypeOf(obj)
    const clone = Object.create(proto)

    Object.defineProperties(clone, Object.getOwnPropertyDescriptors(obj))

    return clone
}

export const parseColor = (type: string, color: string, alpha: number) => {
    try {
        let parsedColor = parse(`${type}(${color})`)
        parsedColor ??= parse(color)

        if (parsedColor === undefined) {
            return color
        }

        parsedColor.alpha = alpha

        if (parsedColor.alpha === 1) {
            return formatHex(parsedColor)
        }

        return formatHex8(parsedColor)
    } catch {
        return '#000000'
    }
}
