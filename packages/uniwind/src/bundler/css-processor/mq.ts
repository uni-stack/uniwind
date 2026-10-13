import { Platform, StyleDependency } from '@/common/consts'
import type { MediaCondition, MediaFeatureComparison, MediaQuery, QueryFeatureFor_MediaFeatureId } from 'lightningcss'
import type { ProcessorBuilder } from './processor'
import type { MediaQueryResolver } from './types'

const comparisons: Record<MediaFeatureComparison, string> = {
    'equal': '===',
    'greater-than': '>',
    'greater-than-equal': '>=',
    'less-than': '<',
    'less-than-equal': '<=',
}

const normalizeMediaValue = <T>(value: T): T => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        // Lightning CSS widens float32s to doubles. Recover their shortest decimal
        // before converting units; float32 needs at most nine significant digits.
        for (let precision = 1; precision <= 9; precision++) {
            const decimal = Number(value.toPrecision(precision))

            if (Math.fround(decimal) === value) {
                return decimal as T
            }
        }
    }

    if (Array.isArray(value)) {
        return value.map(normalizeMediaValue) as T
    }

    if (typeof value === 'object' && value !== null) {
        return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, normalizeMediaValue(value)])) as T
    }

    return value
}

const platforms: Array<string> = [Platform.Android, Platform.iOS, Platform.Web, Platform.Native, Platform.AndroidTV, Platform.AppleTV, Platform.TV]

const negateCondition = (condition: string | null) =>
    condition === null ? null : condition === 'true' ? 'false' : condition === 'false' ? 'true' : `!(${condition})`

const combineConditions = (conditions: Array<string | null>, operator: 'and' | 'or'): string | null => {
    const identity = operator === 'and' ? 'true' : 'false'
    const terminal = operator === 'and' ? 'false' : 'true'

    if (conditions.includes(terminal)) {
        return terminal
    }

    const remaining = conditions.filter((condition): condition is string => condition !== null && condition !== identity)

    if (remaining.length === 0) {
        return conditions.includes(null) ? null : identity
    }

    return remaining.length === 1 ? remaining[0]! : `(${remaining.join(operator === 'and' ? ' && ' : ' || ')})`
}

export class MQ {
    constructor(private readonly Processor: ProcessorBuilder) {}

    processMediaQueries(mediaQueryGroups: Array<Array<MediaQuery>>, currentPlatform: Platform): MediaQueryResolver {
        const dependencies = new Set<StyleDependency>()
        const mq: MediaQueryResolver = {
            conditions: [],
            dependencies: [],
            platform: null,
            rtl: null,
            important: false,
            theme: null,
            active: null,
            focus: null,
            disabled: null,
            dataAttributes: null,
        }

        for (const mediaQueries of mediaQueryGroups) {
            // Alternatives in one @media block use OR; nested blocks use AND.
            const alternatives = mediaQueries.map(({ condition, mediaType, qualifier }) => {
                const conditions: Array<string | null> = []

                if (platforms.includes(mediaType)) {
                    mq.platform = mediaType as Platform
                    const isTV = currentPlatform === Platform.AndroidTV || currentPlatform === Platform.AppleTV
                    const commonPlatform = isTV ? Platform.TV : Platform.Native

                    conditions.push(mediaType === currentPlatform || mediaType === commonPlatform ? 'true' : 'false')
                } else {
                    conditions.push(mediaType === 'print' ? 'false' : mediaType === 'all' || mediaType === 'screen' ? 'true' : null)
                }

                if (condition) {
                    conditions.push(this.processCondition(condition, dependencies))
                }

                const expression = combineConditions(conditions, 'and')

                return qualifier === 'not' ? negateCondition(expression) : expression
            })

            mq.conditions.push(combineConditions(alternatives, 'or') ?? 'true')
        }

        mq.dependencies = Array.from(dependencies)

        return mq
    }

    private processCondition(condition: MediaCondition, dependencies: Set<StyleDependency>): string | null {
        switch (condition.type) {
            case 'not':
                return negateCondition(this.processCondition(condition.value, dependencies))
            case 'operation':
                return combineConditions(condition.conditions.map(condition => this.processCondition(condition, dependencies)), condition.operator)
            case 'feature':
                return this.processFeature(condition.value, dependencies)
        }
    }

    private processFeature(query: QueryFeatureFor_MediaFeatureId, dependencies: Set<StyleDependency>): string | null {
        const { name } = query

        if (name === 'width' || name === 'height') {
            dependencies.add(StyleDependency.Dimensions)
            const dimension = `rt.screen.${name}`

            switch (query.type) {
                case 'range':
                    return `${dimension} ${comparisons[query.operator]} (${this.Processor.CSS.processValue(normalizeMediaValue(query.value))})`
                case 'interval':
                    return combineConditions([
                        `(${this.Processor.CSS.processValue(normalizeMediaValue(query.start))}) ${comparisons[query.startOperator]} ${dimension}`,
                        `${dimension} ${comparisons[query.endOperator]} (${this.Processor.CSS.processValue(normalizeMediaValue(query.end))})`,
                    ], 'and')
                case 'plain':
                    return `${dimension} === (${this.Processor.CSS.processValue(normalizeMediaValue(query.value))})`
                case 'boolean':
                    return `${dimension} > 0`
            }
        }

        if (query.type === 'plain') {
            if (name === 'orientation') {
                dependencies.add(StyleDependency.Orientation)

                return `rt.orientation === ${JSON.stringify(query.value.value)}`
            }

            if (name === 'prefers-color-scheme') {
                dependencies.add(StyleDependency.Theme)

                return `(context.scopedTheme ?? rt.currentThemeName) === ${JSON.stringify(query.value.value)}`
            }
        }

        // Ignored features must remain unknown through negation, rather than becoming false.
        return null
    }
}
