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
                this.logger.error(`Failed to convert color ${color}`)

                return this.black
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
}
