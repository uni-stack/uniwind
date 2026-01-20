import { OverflowKeyword } from 'lightningcss'
import { Logger } from '../logger'
import { DeclarationValues } from '../types'
import { deepEqual, isDefined, pipe, roundToPrecision, shouldBeSerialized } from '../utils'
import type { ProcessorBuilder } from './processor'

export class CSS {
    private readonly logger = new Logger('CSS')

    constructor(private readonly Processor: ProcessorBuilder) {}

    processValue(declarationValue: DeclarationValues): any {
        const processedValue = this.getProcessedValue(declarationValue)

        if (typeof processedValue === 'string') {
            return this.makeSafeForSerialization(processedValue)
        }

        if (Array.isArray(processedValue)) {
            return processedValue.map(value => {
                if (typeof value === 'string') {
                    return this.makeSafeForSerialization(value)
                }

                return value
            })
        }

        if (typeof processedValue === 'object' && processedValue !== null) {
            return Object.fromEntries(
                Object.entries(processedValue).map(([key, value]) => {
                    if (typeof value === 'string') {
                        return [
                            key,
                            this.makeSafeForSerialization(value),
                        ]
                    }

                    return [
                        key,
                        value,
                    ]
                }),
            )
        }

        return processedValue
    }

    private getProcessedValue(declarationValue: DeclarationValues): any {
        if (typeof declarationValue !== 'object') {
            return declarationValue
        }

        if (('type' in declarationValue)) {
            switch (declarationValue.type) {
                case 'function':
                    return this.Processor.Functions.processFunction(declarationValue.value)
                case 'var':
                    return this.Processor.Var.processVar(declarationValue.value)
                case 'number':
                    return declarationValue.value
                case 'token':
                    return this.processValue(declarationValue.value)
                case 'length':
                    return this.Processor.Units.processAnyLength(declarationValue.value)
                case 'color':
                    return this.Processor.Color.processColor(declarationValue.value)
                case 'integer':
                    return declarationValue.value
                case 'comma':
                    return ', '
                case 'dimension':
                case 'value':
                case 'length-percentage':
                    return this.Processor.Units.processLength(declarationValue.value)
                case 'translate': {
                    const [translateX, translateY] = declarationValue.value.map(x => this.processValue(x))

                    return [
                        {
                            translateX,
                        },
                        {
                            translateY,
                        },
                    ]
                }
                case 'translateX':
                    return {
                        translateX: this.Processor.Units.processLength(declarationValue.value),
                    }
                case 'translateY':
                    return {
                        translateY: this.Processor.Units.processLength(declarationValue.value),
                    }
                case 'translateZ': {
                    return {
                        translateZ: this.processValue(declarationValue.value),
                    }
                }
                case 'rotate':
                    return {
                        rotate: `${declarationValue.value.value}${declarationValue.value.type}`,
                    }
                case 'rotateX':
                    return {
                        rotateX: `${declarationValue.value.value}${declarationValue.value.type}`,
                    }
                case 'rotateY':
                    return {
                        rotateY: `${declarationValue.value.value}${declarationValue.value.type}`,
                    }
                case 'rotateZ':
                    return {
                        rotateZ: `${declarationValue.value.value}${declarationValue.value.type}`,
                    }
                case 'scale': {
                    const [scaleX, scaleY] = declarationValue.value.map(x => this.processValue(x))

                    if (scaleX === scaleY) {
                        return {
                            scale: scaleX,
                        }
                    }

                    return [
                        {
                            scaleX,
                        },
                        {
                            scaleY,
                        },
                    ]
                }
                case 'scaleX':
                    return {
                        scaleX: this.processValue(declarationValue.value),
                    }
                case 'scaleY':
                    return {
                        scaleY: this.processValue(declarationValue.value),
                    }
                case 'scaleZ':
                    return {
                        scaleZ: this.processValue(declarationValue.value),
                    }
                case 'percentage':
                    return `${declarationValue.value * 100}%`
                case 'token-list':
                    return declarationValue.value.reduce((acc, token) => {
                        const tokenValue = this.processValue(token)

                        return acc + tokenValue
                    }, '')
                case 'rgb':
                case 'oklab':
                case 'oklch':
                case 'hsl':
                case 'hwb':
                case 'lab':
                case 'lch':
                case 'srgb':
                    return this.Processor.Color.processColor(declarationValue)
                case 'delim':
                    if (declarationValue.value === '.') {
                        return '.'
                    }

                    // +, - etc.
                    return ` ${declarationValue.value} `
                case 'ident':
                    if (this.Processor.Color.isColor(declarationValue.value)) {
                        return this.Processor.Color.processColor(declarationValue.value)
                    }

                    if (declarationValue.value === 'currentcolor') {
                        return 'this["currentColor"]'
                    }

                    return declarationValue.value
                case 'env':
                    if (declarationValue.value.name.type === 'ua' && declarationValue.value.name.value.startsWith('safe-area-inset-')) {
                        const inset = declarationValue.value.name.value.replace('safe-area-inset-', '')

                        return `rt.insets.${inset}`
                    }

                    this.logUnsupported(`Unsupported env value - ${JSON.stringify(declarationValue.value)}`)

                    return undefined
                case 'time': {
                    const unit = declarationValue.value.type === 'milliseconds' ? 'ms' : 's'

                    return `${declarationValue.value.value}${unit}`
                }
                case 'cubic-bezier': {
                    const bezier = [
                        declarationValue.x1,
                        declarationValue.y1,
                        declarationValue.x2,
                        declarationValue.y2,
                    ]

                    return `rt.cubicBezier(${bezier.join(',')})`
                }
                case 'seconds':
                    return `${declarationValue.value}s`
                case 'milliseconds':
                    return `${declarationValue.value}ms`
                case 'pair':
                    return declarationValue.inside.type
                case 'currentcolor':
                    return 'this["currentColor"]'
                case 'calc':
                    return this.Processor.Functions.processCalc(declarationValue.value)
                case 'min':
                case 'max':
                case 'abs':
                    return this.Processor.Functions.processMathFunction(declarationValue.type, declarationValue.value)
                case 'keyword':
                    if ('value' in declarationValue) {
                        return declarationValue.value
                    }

                    this.logUnsupported(`Unsupported keyword value - ${JSON.stringify(declarationValue)}`)

                    return undefined
                case 'min-max':
                case 'track-breadth':
                    return declarationValue.type
                case 'explicit':
                    return `${this.processValue(declarationValue.width)} ${this.processValue(declarationValue.height)}`
                case 'angle':
                    return `${declarationValue.value.value}${declarationValue.value.type}`
                case 'gradient':
                    if (declarationValue.value.type === 'linear') {
                        const direction = String(this.processValue(declarationValue.value.direction))

                        return [
                            direction.includes('deg') ? direction : `to ${direction}`,
                            ...declarationValue.value.items.map(item => this.processValue(item)),
                        ].join(', ')
                    }

                    return undefined
                case 'color-stop':
                    return [
                        this.Processor.Color.processColor(declarationValue.color),
                        declarationValue.position ? this.processValue(declarationValue.position) : null,
                    ].filter(isDefined).join(' ')
                case 'side':
                    return declarationValue.side
                case 'absolute':
                    if ('value' in declarationValue) {
                        return typeof declarationValue.value === 'string'
                            ? declarationValue.value
                            : this.processValue(declarationValue.value)
                    }

                    return declarationValue.type
                case 'hash':
                    return `#${declarationValue.value}`
                case 'line-style':
                    return declarationValue.value
                case 'parenthesis-block':
                    return '('
                case 'close-parenthesis':
                    return ')'
                case 'light-dark':
                    return `rt.lightDark( ${this.processValue(declarationValue.light)}, ${this.processValue(declarationValue.dark)} )`
                case 'unresolved-color':
                    return this.getProcessedValue(declarationValue.value)
                case 'track-list':
                case 'sticky':
                case 'fit-content':
                case 'shape':
                    return undefined
                case 'weight':
                case 'horizontal':
                case 'vertical':
                case 'white-space':
                case 'string':
                case 'self-position':
                case 'content-distribution':
                case 'content-position':
                    return declarationValue.value
                case 'baseline-position':
                    return 'baseline'
                default:
                    // CSS string properties like absolute, relative, italic, etc.
                    if (Object.keys(declarationValue).length === 1) {
                        return declarationValue.type
                    }

                    this.logUnsupported(`Unsupported value type - ${JSON.stringify(declarationValue.type)}`)

                    return undefined
            }
        }

        if ('top' in declarationValue) {
            return {
                top: this.processValue(declarationValue.top),
                right: this.processValue(declarationValue.right),
                bottom: this.processValue(declarationValue.bottom),
                left: this.processValue(declarationValue.left),
            }
        }

        if ('topLeft' in declarationValue) {
            return {
                topLeft: this.processValue(declarationValue.topLeft),
                topRight: this.processValue(declarationValue.topRight),
                bottomLeft: this.processValue(declarationValue.bottomLeft),
                bottomRight: this.processValue(declarationValue.bottomRight),
            }
        }

        if ('grow' in declarationValue) {
            return {
                flexGrow: declarationValue.grow,
                flexShrink: declarationValue.shrink,
                flexBasis: this.processValue(declarationValue.basis),
            }
        }

        if (Array.isArray(declarationValue)) {
            if (declarationValue.length === 1) {
                return this.processValue(declarationValue[0]!)
            }

            return this.addComaBetweenTokens(declarationValue).reduce<string | number>((acc, value, index, array) => {
                if (typeof value === 'object') {
                    const nextValue = array.at(index + 1)

                    // Remove duplicates
                    if (deepEqual(value, nextValue)) {
                        return acc
                    }

                    const result = this.processValue(value)

                    return acc === '' && typeof result === 'number'
                        ? result
                        : acc + result
                }

                return acc + value
            }, '')
        }

        if ('property' in declarationValue) {
            const property = typeof declarationValue.property === 'string'
                ? declarationValue.property
                : declarationValue.property.property

            return `${property},`
        }

        if ('case' in declarationValue) {
            return declarationValue.case
        }

        if ('angle' in declarationValue) {
            const angles = pipe([
                ['rotateX', declarationValue.x * declarationValue.angle.value],
                ['rotateY', declarationValue.y * declarationValue.angle.value],
                ['rotateZ', declarationValue.z * declarationValue.angle.value],
            ])(
                x => x.filter(([, value]) => value !== 0),
                x => x.map(([key, value]) => [key, `${value}${declarationValue.angle.type}`]),
                Object.fromEntries,
            )

            return angles
        }

        if (this.isOverflow(declarationValue)) {
            if (declarationValue.x === declarationValue.y) {
                return {
                    overflow: declarationValue.x,
                }
            }

            return {
                overflowX: declarationValue.x,
                overflowY: declarationValue.y,
            }
        }

        if ('auto' in declarationValue) {
            return declarationValue.ratio
                ? `${declarationValue.ratio[0]}/${declarationValue.ratio[1]}`
                : 'auto'
        }

        if ('x' in declarationValue && 'y' in declarationValue) {
            return {
                x: this.processValue(declarationValue.x),
                y: this.processValue(declarationValue.y),
            }
        }

        // Shadows
        if ('xOffset' in declarationValue) {
            return [
                'inset' in declarationValue && declarationValue.inset ? 'inset' : undefined,
                this.processValue(declarationValue.xOffset),
                this.processValue(declarationValue.yOffset),
                this.processValue(declarationValue.blur),
                this.processValue(declarationValue.spread),
                this.processValue(declarationValue.color),
            ].filter(isDefined).join(' ')
        }

        if ('blockStart' in declarationValue) {
            const startValue = this.processValue(declarationValue.blockStart)
            const endValue = this.processValue(declarationValue.blockEnd)

            return {
                start: startValue,
                end: endValue,
            }
        }

        if ('inlineStart' in declarationValue) {
            const startValue = this.processValue(declarationValue.inlineStart)
            const endValue = this.processValue(declarationValue.inlineEnd)

            return {
                start: startValue,
                end: endValue,
            }
        }

        if ('start' in declarationValue) {
            const startValue = this.processValue(declarationValue.start)
            const endValue = this.processValue(declarationValue.end)

            return {
                start: startValue,
                end: endValue,
            }
        }

        if ('row' in declarationValue) {
            return {
                row: this.processValue(declarationValue.row),
                column: this.processValue(declarationValue.column),
            }
        }

        if ('keyword' in declarationValue) {
            return declarationValue.keyword === 'auto' || declarationValue.keyword === 'pointer'
                ? declarationValue.keyword
                : 'auto'
        }

        if ('style' in declarationValue && 'width' in declarationValue) {
            return {
                style: this.processValue(declarationValue.style),
                width: declarationValue.width.type === 'length'
                    ? this.processValue(declarationValue.width.value)
                    : undefined,
                color: this.Processor.Color.processColor(declarationValue.color),
            }
        }

        if ('duration' in declarationValue) {
            return [
                this.processValue(declarationValue.name),
                this.processValue(declarationValue.duration),
                this.processValue(declarationValue.timingFunction),
                this.processValue(declarationValue.delay),
                this.processValue(declarationValue.iterationCount),
                declarationValue.direction,
                declarationValue.fillMode,
                declarationValue.playState,
                this.processValue(declarationValue.timeline),
            ].filter(Boolean).join(' ')
        }

        this.logUnsupported(`Unsupported value - ${JSON.stringify(declarationValue)}`)

        return undefined
    }

    private isOverflow(value: any): value is { x: OverflowKeyword; y: OverflowKeyword } {
        return typeof value === 'object' && 'x' in value && ['hidden', 'visible'].includes(value.x)
    }

    /**
     * Between some tokens there isn't a comma but it should be.
     * For example this applies to Array of shadows
     */
    private addComaBetweenTokens(values: Array<DeclarationValues>) {
        return values.reduce<Array<any>>((acc, value, index, array) => {
            const next = array.at(index + 1)

            acc.push(value)

            if (next === undefined) {
                return acc
            }

            if (typeof next === 'object' && 'type' in next && next.type === 'token' && next.value.type === 'comma') {
                return acc
            }

            if (!(typeof value === 'object' && 'xOffset' in value && 'blur' in value)) {
                return acc
            }

            acc.push({
                type: 'token',
                value: {
                    type: 'comma',
                },
            })

            return acc
        }, [])
    }

    private logUnsupported(message: string) {
        this.logger.warn(
            [
                message,
                this.Processor.meta.className !== undefined ? `for className ${this.Processor.meta.className}` : null,
            ].filter(Boolean).join(' '),
        )
    }

    private makeSafeForSerialization(value: string) {
        if (shouldBeSerialized(value)) {
            return value
        }

        if (value.endsWith('%')) {
            return `"${roundToPrecision(parseFloat(value), 2)}%"`
        }

        return `"${value}"`
    }
}
