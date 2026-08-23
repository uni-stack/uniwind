import type { CalcFor_DimensionPercentageFor_LengthValue, CalcFor_Length, CssColor, Function as FunctionType } from 'lightningcss'
import { Logger } from '../logger'
import type { ProcessorBuilder } from './processor'
import { pipe, roundToPrecision } from './utils'

const FILTER_FUNCTIONS = new Set([
    'blur',
    'brightness',
    'contrast',
    'grayscale',
    'hue-rotate',
    'invert',
    'opacity',
    'saturate',
    'sepia',
])

const FILTER_UNITS: Record<string, string> = {
    blur: 'px',
}

export class Functions {
    private readonly logger = new Logger('Functions')

    constructor(private readonly Processor: ProcessorBuilder) {}

    processCalc(calc: CalcFor_DimensionPercentageFor_LengthValue | CalcFor_Length): string {
        switch (calc.type) {
            case 'sum': {
                const sum = calc.value.map(x => this.processCalc(x)).join(' + ')

                return this.tryEval(sum)
            }
            case 'value':
                return this.Processor.CSS.processValue(calc.value)
            case 'function':
                return this.Processor.CSS.processValue(calc.value)
            case 'number':
                return String(calc.value)
            default:
                this.logger.warn(`Unsupported calc type - ${calc.type}`)

                return ''
        }
    }

    processFunction(fn: string | FunctionType) {
        if (typeof fn !== 'object') {
            this.logger.warn(`Unsupported function - ${fn}`)

            return fn
        }

        if (fn.name === 'calc') {
            const calc = this.Processor.CSS.processValue(fn.arguments)

            return pipe(calc)(
                String,
                x => this.Processor.Functions.tryEval(x),
            )
        }

        if (fn.name === 'cubic-bezier') {
            const cubicArguments = pipe(this.Processor.CSS.processValue(fn.arguments))(
                String,
                x => x.replace(/,\s/g, ','),
            )

            return `rt.cubicBezier(${cubicArguments})`
        }

        if (fn.name === 'min') {
            return `Math.min(${this.Processor.CSS.processValue(fn.arguments)})`
        }

        if (fn.name === 'max') {
            return `Math.max(${this.Processor.CSS.processValue(fn.arguments)})`
        }

        if (fn.name === 'linear-gradient') {
            return this.Processor.CSS.processValue(fn.arguments)
        }

        if (fn.name === 'color-mix') {
            return this.processColorMix(fn)
        }

        if (
            [
                'rgb',
                'oklab',
                'oklch',
                'hsl',
                'hwb',
                'lab',
                'lch',
                'srgb',
            ].includes(fn.name)
        ) {
            const color = `${fn.name}(${this.Processor.CSS.processValue(fn.arguments)})`

            return this.Processor.Color.processColor(color as CssColor)
        }

        if (FILTER_FUNCTIONS.has(fn.name)) {
            return this.processFilterFunction(fn)
        }

        if (['conic-gradient', 'radial-gradient'].includes(fn.name)) {
            // Not supported by RN
            return '""'
        }

        if (['skewX', 'skewY'].includes(fn.name)) {
            return `"${fn.name}(${this.Processor.CSS.processValue(fn.arguments).replace(/"/g, '')})"`
        }

        if (fn.name === 'hairlineWidth') {
            return 'rt.hairlineWidth'
        }

        if (fn.name === 'pixelRatio') {
            if (fn.arguments.length === 0) {
                return 'rt.pixelRatio(1)'
            }

            return `rt.pixelRatio(${this.Processor.CSS.processValue(fn.arguments)})`
        }

        if (fn.name === 'fontScale') {
            if (fn.arguments.length === 0) {
                return 'rt.fontScale(1)'
            }

            return `rt.fontScale(${this.Processor.CSS.processValue(fn.arguments)})`
        }

        if (fn.name === 'drop-shadow') {
            return this.processDropShadow(fn)
        }

        this.logger.warn(`Unsupported function - ${fn.name}`)

        return fn.name
    }

    processMathFunction(
        name: string,
        value:
            | Array<CalcFor_DimensionPercentageFor_LengthValue>
            | Array<CalcFor_Length>
            | CalcFor_DimensionPercentageFor_LengthValue
            | CalcFor_Length,
    ) {
        if (!Array.isArray(value)) {
            return `Math.${name}(${this.processCalc(value)})`
        }

        const values = value.map(x => this.processCalc(x)).join(' , ')

        return `Math.${name}(${values})`
    }

    private tryEval(value: string) {
        // Match units like %, deg, rad, grad, turn that are not preceded by letters or hyphens
        const units = Array.from(
            value
                .replace(/"/g, '')
                .match(/(?<![A-Za-z-])(?:%|deg|rad|grad|turn)(?=\s|$)/g) ?? [],
        )

        if (units.length === 0) {
            return value
        }

        if (new Set(units).size !== 1) {
            this.logger.error(`Invalid calc, you can't mix multiple units`)

            return value
        }

        if (units.includes('%') && value.includes('+')) {
            this.logger.error(`Invalid calc, you can't mix % with other units`)

            return value
        }

        const unit = units.at(0) ?? ''

        try {
            const numericValue = value
                .replace(/"/g, '')
                .replace(new RegExp(unit, 'g'), '')

            return new Function(`return ${numericValue} + '${unit}'`)()
        } catch {
            this.logger.error(`Invalid calc ${value}`)

            return value
        }
    }

    private processFilterFunction(fn: FunctionType) {
        const [argument] = fn.arguments
        const amount = argument?.type === 'token' && argument.value.type === 'percentage'
            ? roundToPrecision(argument.value.value, 2)
            : this.Processor.CSS.processValue(fn.arguments)
        const expression = typeof amount === 'string' && amount.startsWith('"') ? amount : `(${amount})`

        return `"${fn.name}(" + ${expression} + "${FILTER_UNITS[fn.name] ?? ''})"`
    }

    private processDropShadow(fn: FunctionType) {
        const nonWhitespaceArgs = fn.arguments.filter(
            arg => !(typeof arg === 'object' && 'type' in arg && arg.type === 'token' && arg.value.type === 'white-space'),
        )

        const parts = nonWhitespaceArgs.map(arg => {
            const processed = this.Processor.CSS.processValue(arg)

            return typeof processed === 'string' && processed.startsWith('"')
                ? processed
                : `(${processed})`
        })

        const expression = parts.join(' + " " + ')

        return `"drop-shadow(" + ${expression} + ")"`
    }

    private processColorMix(fn: FunctionType) {
        const tokens = fn.arguments
            .map(arg =>
                pipe(arg)(
                    x => this.Processor.CSS.processValue(x),
                    String,
                    x => x.trim(),
                )
            )
            .filter(token => !['', ',', 'in', 'srgb', 'rgb', 'hsl', 'hwb', 'lab', 'lch', 'oklab', 'oklch'].includes(token.replace(/"/g, '')))

        return `rt.colorMix(${tokens.join(', ')})`
    }
}
