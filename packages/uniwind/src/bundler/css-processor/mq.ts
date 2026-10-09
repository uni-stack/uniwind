import type { ColorScheme, Orientation } from '@/common/consts'
import { Platform } from '@/common/consts'
import type { MediaCondition, MediaQuery, QueryFeatureFor_MediaFeatureId } from 'lightningcss'
import type { ProcessorBuilder } from './processor'
import type { MediaQueryResolver } from './types'

const EXCLUSIVE_BOUND_EPSILON = 0.01

export class MQ {
    constructor(private readonly Processor: ProcessorBuilder) {}

    processMediaQueries(mediaQueries: Array<MediaQuery>) {
        const mq = this.getInitialMediaQueryResolver()

        mediaQueries.forEach(mediaQuery => {
            const { condition, mediaType } = mediaQuery

            if (
                [
                    Platform.Android,
                    Platform.iOS,
                    Platform.Native,
                    Platform.AndroidTV,
                    Platform.AppleTV,
                    Platform.TV,
                ].includes(mediaType as Platform)
            ) {
                mq.platform = mediaType as Platform
            }

            if (condition) this.processCondition(condition, mq)
        })

        return mq
    }

    private processCondition(condition: MediaCondition, mq: MediaQueryResolver) {
        if (condition.type === 'operation' && condition.operator === 'and') {
            condition.conditions.forEach(part => this.processCondition(part, mq))
            return
        }

        if (condition.type !== 'feature') return

        if (condition.value.type === 'range') {
            this.processDimensionMediaQuery(condition.value, mq)
        }

        if (condition.value.type === 'plain') {
            this.processPlainMediaQuery(condition.value, mq)
        }

        if (condition.value.type === 'interval') {
            const { name, start, startOperator, end, endOperator } = condition.value
            const reverseOperator = {
                'less-than': 'greater-than',
                'less-than-equal': 'greater-than-equal',
                'greater-than': 'less-than',
                'greater-than-equal': 'less-than-equal',
                'equal': 'equal',
            } as const

            this.processDimensionMediaQuery({ type: 'range', name, operator: reverseOperator[startOperator], value: start }, mq)
            this.processDimensionMediaQuery({ type: 'range', name, operator: endOperator, value: end }, mq)
        }
    }

    private processDimensionMediaQuery(query: QueryFeatureFor_MediaFeatureId & { type: 'range' }, mq: MediaQueryResolver) {
        const { operator, value, name } = query
        if (name !== 'width' && name !== 'height') return

        const minKey = name === 'height' ? 'minHeight' : 'minWidth'
        const maxKey = name === 'height' ? 'maxHeight' : 'maxWidth'
        // Media-query em units refer to the initial font size, just like rem,
        // rather than an element's (possibly scoped) font-size variable.
        const result = value.type === 'length' && value.value.type === 'value' && value.value.value.unit === 'em'
            ? this.Processor.Units.processLength({ ...value.value.value, unit: 'rem' })
            : this.Processor.CSS.processValue(value)
        const setBound = (key: typeof minKey | typeof maxKey, bound: any, operation: 'min' | 'max') => {
            mq[key] = typeof mq[key] === 'number' && typeof bound === 'number'
                ? Math[operation](mq[key], bound)
                : `Math.${operation}(${mq[key]}, ${bound})`
        }

        if (operator === 'greater-than-equal' || operator === 'equal') {
            setBound(minKey, result, 'max')
        }

        if (operator === 'greater-than') {
            setBound(
                minKey,
                typeof result === 'number'
                    ? result + EXCLUSIVE_BOUND_EPSILON
                    : `(${result}) + ${EXCLUSIVE_BOUND_EPSILON}`,
                'max',
            )
        }

        if (operator === 'less-than-equal' || operator === 'equal') {
            setBound(maxKey, result, 'min')
        }

        if (operator === 'less-than') {
            setBound(
                maxKey,
                typeof result === 'number'
                    ? result - EXCLUSIVE_BOUND_EPSILON
                    : `(${result}) - ${EXCLUSIVE_BOUND_EPSILON}`,
                'min',
            )
        }
    }

    private processPlainMediaQuery(query: QueryFeatureFor_MediaFeatureId & { type: 'plain' }, mq: MediaQueryResolver) {
        const { value, name } = query

        switch (name) {
            case 'width':
            case 'height':
                this.processDimensionMediaQuery({ type: 'range', name, operator: 'equal', value }, mq)
                break
            case 'orientation':
                mq.orientation = value.value as Orientation

                break
            case 'prefers-color-scheme':
                mq.colorScheme = value.value as ColorScheme

                break
            default:
                break
        }
    }

    private getInitialMediaQueryResolver(): MediaQueryResolver {
        return {
            minWidth: 0,
            maxWidth: Number.MAX_VALUE,
            minHeight: 0,
            maxHeight: Number.MAX_VALUE,
            platform: null,
            rtl: null,
            important: false,
            colorScheme: null,
            orientation: null,
            theme: null,
            active: null,
            focus: null,
            disabled: null,
            dataAttributes: null,
        }
    }
}
