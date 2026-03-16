import { Color as ColorType, converter, formatHex, formatHex8, parse } from 'culori'
import { CssColor, UnresolvedColor } from 'lightningcss'
import { Logger } from '../logger'
import { pipe } from '../utils'
import type { ProcessorBuilder } from './processor'

export class Color {
    private toRgb = converter('rgb')

    private readonly black = '#000000'

    private readonly logger = new Logger('Color')

    constructor(private readonly Processor: ProcessorBuilder) {}

    processColor(color: CssColor | UnresolvedColor) {
        if (typeof color === 'string') {
            const parsed = parse(color)

            if (parsed === undefined) {
                const colorFunction = color.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/)?.[1]

                if (colorFunction === undefined) {
                    this.logger.error(`Failed to convert color ${color}`)

                    return this.black
                }

                const colorValueRaw = this.clearColorFunctionValue(color, colorFunction)
                const { colorValue, alpha } = this.extractAlphaFromColorFunctionValue(colorValueRaw)

                return `rt.parseColor("${colorFunction}", ${colorValue}, ${alpha})`
            }

            return this.format(parsed)
        }

        try {
            if (color.type === 'currentcolor') {
                return 'this["currentColor"]'
            }

            if (color.type === 'rgb' || color.type === 'srgb') {
                const alpha = typeof color.alpha === 'number'
                    ? color.alpha
                    : pipe(color.alpha)(
                        x => this.Processor.CSS.processValue(x),
                        Number,
                        x => isNaN(x) ? 1 : x,
                    )

                return this.format({
                    r: color.r / 255,
                    g: color.g / 255,
                    b: color.b / 255,
                    alpha,
                    mode: 'rgb',
                })
            }

            const result = this.toRgb({
                mode: color.type,
                ...color,
            } as ColorType)

            return this.format(result)
        } catch {
            this.logger.error(`Failed to convert color ${JSON.stringify(color)}`)

            return this.black
        }
    }

    isColor(value: unknown): value is CssColor {
        return typeof value === 'string' && parse(value) !== undefined
    }

    private format(color: ColorType) {
        if (color.alpha === 1 || color.alpha === undefined) {
            return formatHex(color)
        }

        return formatHex8(color)
    }

    private clearColorFunctionValue(color: string, colorFunction: string) {
        return color
            .replace(colorFunction, '')
            .replace('"from"', '')
            .replace('"r" "g" "b"', '')
            .slice(1, -1)
            .trim()
    }

    private extractAlphaFromColorFunctionValue(color: string) {
        // This regex matches a string that may contain an optional alpha value at the end, separated by a slash.
        // this[`--color-red-500`] / 0.5 => color: this[`--color-red-500`], alpha: 0.5
        // this[`--color-red-500`] / "25%" => color: this[`--color-red-500`], alpha: 0.25
        const regex = /^(.*?)(?:\s*\/\s*(["']?)(\d+(?:\.\d+)?)(%?)\2)?$/
        const match = color.match(regex)

        if (!match) {
            return { color: color.trim(), alpha: 1 }
        }

        const colorStr = match[1]?.trim() ?? ''
        const alphaStr = match[3]
        const isPercentage = match[4] === '%'

        let alpha = 1

        if (alphaStr !== undefined) {
            alpha = Number(alphaStr)

            if (isPercentage) {
                alpha = alpha / 100
            }
        }

        return {
            colorValue: colorStr,
            alpha,
        }
    }
}
