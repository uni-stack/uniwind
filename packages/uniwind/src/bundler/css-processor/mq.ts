import type { ColorScheme, Orientation } from '@/common/consts'
import { Platform } from '@/common/consts'
import type { MediaCondition, MediaQuery, QueryFeatureFor_MediaFeatureId } from 'lightningcss'
import type { ProcessorBuilder } from './processor'
import type { MediaQueryResolver } from './types'

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

                return
            }

            if (condition) {
                this.processCondition(condition, mq)
            }
        })

        return mq
    }

    private processCondition(condition: MediaCondition, mq: MediaQueryResolver) {
        if (condition.type === 'operation' && condition.operator === 'and') {
            condition.conditions.forEach(condition => this.processCondition(condition, mq))

            return
        }

        if (condition.type !== 'feature') {
            return
        }

        if (condition.value.type === 'range') {
            this.processDimensionMediaQuery(condition.value, mq)
        }

        if (condition.value.type === 'plain') {
            this.processPlainMediaQuery(condition.value, mq)
        }
    }

    private processDimensionMediaQuery(query: QueryFeatureFor_MediaFeatureId & { type: 'range' }, mq: MediaQueryResolver) {
        const { name, operator, value } = query

        if (name !== 'width' && name !== 'height') {
            return
        }

        const dimension = name === 'width' ? 'Width' : 'Height'
        const result = this.Processor.CSS.processValue(value)

        if (operator === 'greater-than-equal') {
            mq[`min${dimension}`] = result
            mq[`min${dimension}Operator`] = '>='
        }

        if (operator === 'greater-than') {
            mq[`min${dimension}`] = result
            mq[`min${dimension}Operator`] = '>'
        }

        if (operator === 'less-than-equal') {
            mq[`max${dimension}`] = result
            mq[`max${dimension}Operator`] = '<='
        }

        if (operator === 'less-than') {
            mq[`max${dimension}`] = result
            mq[`max${dimension}Operator`] = '<'
        }
    }

    private processPlainMediaQuery(query: QueryFeatureFor_MediaFeatureId & { type: 'plain' }, mq: MediaQueryResolver) {
        const { value, name } = query

        switch (name) {
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
            minWidthOperator: null,
            maxWidthOperator: null,
            minHeight: 0,
            maxHeight: Number.MAX_VALUE,
            minHeightOperator: null,
            maxHeightOperator: null,
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
