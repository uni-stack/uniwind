import { DimensionPercentageFor_LengthValue, Length, LengthValue } from 'lightningcss'
import { Logger } from '../logger'
import type { ProcessorBuilder } from './processor'

export class Units {
    private readonly logger = new Logger('Units')

    constructor(private readonly Processor: ProcessorBuilder) {}

    processLength(length: LengthValue | DimensionPercentageFor_LengthValue | number) {
        if (typeof length === 'number') {
            return length
        }

        if ('unit' in length) {
            switch (length.unit) {
                case 'px':
                    return this.replaceInfinity(length.value)
                case 'vw':
                    return `rt.screen.width * ${length.value / 100}`
                case 'vh':
                    return `rt.screen.height * ${length.value / 100}`
                case 'rem':
                    return length.value * this.Processor.vars['--uniwind-em']
                case 'em':
                    return `this[\`--uniwind-em\`] * ${length.value}`
                default:
                    this.logger.warn(`Unsupported unit - ${length.unit}`)

                    return length.value
            }
        }

        return this.Processor.CSS.processValue(length)
    }

    processAnyLength(length: DimensionPercentageFor_LengthValue | Length | LengthValue) {
        if ('type' in length) {
            switch (length.type) {
                case 'value':
                case 'dimension':
                    return this.processLength(length.value)
                case 'percentage':
                    return `${length.value * 100}%`
                default:
                    this.logger.warn(`Unsupported length type - ${length.type}`)

                    return length.value
            }
        }

        return this.processLength(length)
    }

    replaceInfinity(value: any) {
        return value === Infinity ? 99999 : value
    }
}
