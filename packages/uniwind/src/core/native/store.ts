/* eslint-disable max-depth */
import { Dimensions, Platform } from 'react-native'
import { Orientation, StyleDependency } from '../../types'
import { UniwindListener } from '../listener'
import { ComponentState, GenerateStyleSheetsCallback, RNStyle, Style, StyleSheets, ThemeName, UniwindContextType } from '../types'
import { cloneWithAccessors } from './native-utils'
import { parseBoxShadow, parseFontVariant, parseTextShadowMutation, parseTransformsMutation, resolveGradient } from './parsers'
import { UniwindRuntime } from './runtime'

type StylesResult = {
    styles: RNStyle
    dependencies: Array<StyleDependency>
    dependencySum: number
}

const emptyState: StylesResult = { styles: {}, dependencies: [], dependencySum: 0 }

class UniwindStoreBuilder {
    runtime = UniwindRuntime
    vars = {} as Record<ThemeName, Record<string, unknown>>
    private stylesheet = {} as StyleSheets
    private cache = {} as Record<ThemeName, Map<string, StylesResult>>

    getStyles(
        className: string | undefined,
        componentProps: Record<string, any> | undefined,
        state: ComponentState | undefined,
        uniwindContext: UniwindContextType,
    ): StylesResult {
        if (className === undefined || className === '') {
            return emptyState
        }

        const cacheKey = `${className}${state?.isDisabled ?? false}${state?.isFocused ?? false}${state?.isPressed ?? false}`
        const cache = this.cache[uniwindContext.scopedTheme ?? this.runtime.currentThemeName]

        if (!cache) {
            return emptyState
        }

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey)!
        }

        const result = this.resolveStyles(className, componentProps, state, uniwindContext)

        // Don't cache styles that depend on data attributes
        if (!result.hasDataAttributes) {
            cache.set(cacheKey, result)
            UniwindListener.subscribe(
                () => cache.delete(cacheKey),
                result.dependencies,
                { once: true },
            )
        }

        return result
    }

    reinit = (generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) => {
        const config = generateStyleSheetCallback(this.runtime)
        const { scopedVars, stylesheet, vars } = config
        const platformVars = scopedVars[`__uniwind-platform-${Platform.OS}`]

        if (platformVars) {
            Object.defineProperties(vars, Object.getOwnPropertyDescriptors(platformVars))
        }

        this.stylesheet = stylesheet
        this.vars = Object.fromEntries(themes.map(theme => {
            const clonedVars = cloneWithAccessors(vars)
            const themeVars = scopedVars[`__uniwind-theme-${theme}`]

            if (themeVars) {
                Object.defineProperties(clonedVars, Object.getOwnPropertyDescriptors(themeVars))
            }

            return [theme, clonedVars]
        }))
        this.cache = Object.fromEntries(themes.map(theme => [theme, new Map()]))

        if (__DEV__) {
            UniwindListener.notifyAll()
        }
    }

    private resolveStyles(
        classNames: string,
        componentProps: Record<string, any> | undefined,
        state: ComponentState | undefined,
        uniwindContext: UniwindContextType,
    ) {
        const result = {} as Record<string, any>
        // At this point we're sure that theme is correct
        const theme = uniwindContext.scopedTheme ?? this.runtime.currentThemeName
        let vars = this.vars[theme]!
        const originalVars = vars
        let hasDataAttributes = false
        const dependencies = new Set<StyleDependency>()
        let dependencySum = 0
        const bestBreakpoints = new Map<string, Style>()
        const isScopedTheme = uniwindContext.scopedTheme !== null

        for (const className of classNames.split(' ')) {
            if (!(className in this.stylesheet)) {
                continue
            }

            for (const style of this.stylesheet[className] as Array<Style>) {
                if (style.dependencies) {
                    style.dependencies.forEach(dep => {
                        if (dep === StyleDependency.Theme && isScopedTheme) {
                            return
                        }

                        dependencies.add(dep)
                        dependencySum |= 1 << dep
                    })
                }

                if (style.dataAttributes !== null) {
                    hasDataAttributes = true
                }

                if (
                    style.minWidth > this.runtime.screen.width
                    || style.maxWidth < this.runtime.screen.width
                    || (style.theme !== null && theme !== style.theme)
                    || (style.orientation !== null && this.runtime.orientation !== style.orientation)
                    || (style.rtl !== null && this.runtime.rtl !== style.rtl)
                    || (style.active !== null && state?.isPressed !== style.active)
                    || (style.focus !== null && state?.isFocused !== style.focus)
                    || (style.disabled !== null && state?.isDisabled !== style.disabled)
                    || (style.dataAttributes !== null && !this.validateDataAttributes(style.dataAttributes, componentProps))
                ) {
                    continue
                }

                for (const [property, valueGetter] of style.entries) {
                    const previousBest = bestBreakpoints.get(property)

                    if (
                        previousBest
                        && (
                            previousBest.minWidth > style.minWidth
                            || previousBest.complexity > style.complexity
                            || previousBest.importantProperties.includes(property)
                        )
                    ) {
                        continue
                    }

                    if (property[0] === '-') {
                        // Clone vars object if we are adding inline variables
                        if (vars === originalVars) {
                            vars = cloneWithAccessors(originalVars)
                        }

                        Object.defineProperty(vars, property, {
                            configurable: true,
                            enumerable: true,
                            get: valueGetter,
                        })
                    } else {
                        Object.defineProperty(result, property, {
                            configurable: true,
                            enumerable: true,
                            get: () => valueGetter.call(vars),
                        })
                    }

                    bestBreakpoints.set(property, style)
                }
            }
        }

        if (result.lineHeight !== undefined && result.lineHeight < 6) {
            Object.defineProperty(result, 'lineHeight', {
                value: result.fontSize * result.lineHeight,
                configurable: true,
                enumerable: true,
            })
        }

        if (result.boxShadow !== undefined) {
            Object.defineProperty(result, 'boxShadow', {
                value: parseBoxShadow(result.boxShadow),
                configurable: true,
                enumerable: true,
            })
        }

        if (result.visibility === 'hidden') {
            Object.defineProperty(result, 'display', {
                value: 'none',
                configurable: true,
                enumerable: true,
            })
        }

        if (
            result.borderStyle !== undefined && result.borderColor === undefined
        ) {
            Object.defineProperty(result, 'borderColor', {
                value: '#000000',
                configurable: true,
                enumerable: true,
            })
        }

        if (
            result.outlineStyle !== undefined && result.outlineColor === undefined
        ) {
            Object.defineProperty(result, 'outlineColor', {
                value: '#000000',
                configurable: true,
                enumerable: true,
            })
        }

        if (result.fontVariant !== undefined) {
            Object.defineProperty(result, 'fontVariant', {
                value: parseFontVariant(result.fontVariant),
                configurable: true,
                enumerable: true,
            })
        }

        parseTransformsMutation(result)

        if (result.experimental_backgroundImage !== undefined) {
            Object.defineProperty(result, 'experimental_backgroundImage', {
                value: resolveGradient(result.experimental_backgroundImage),
                configurable: true,
                enumerable: true,
            })
        }

        if (result.textShadow !== undefined) {
            parseTextShadowMutation(result)
        }

        return {
            styles: { ...result } as RNStyle,
            dependencies: Array.from(dependencies),
            dependencySum,
            hasDataAttributes,
        }
    }

    private validateDataAttributes(dataAttributes: Record<string, string>, props: Record<string, any> = {}) {
        for (const [attribute, expectedAttributeValue] of Object.entries(dataAttributes)) {
            const attributeValue = props[attribute]

            if (expectedAttributeValue === 'true') {
                if (attributeValue !== true && attributeValue !== 'true') {
                    return false
                }

                continue
            }

            if (expectedAttributeValue === 'false') {
                if (attributeValue !== false && attributeValue !== 'false') {
                    return false
                }

                continue
            }

            if (attributeValue !== expectedAttributeValue) {
                return false
            }
        }

        return true
    }
}

export const UniwindStore = new UniwindStoreBuilder()

Dimensions.addEventListener('change', ({ window }) => {
    const newOrientation = window.width > window.height ? Orientation.Landscape : Orientation.Portrait
    const orientationChanged = UniwindStore.runtime.orientation !== newOrientation

    UniwindStore.runtime.screen = {
        width: window.width,
        height: window.height,
    }
    UniwindStore.runtime.orientation = newOrientation
    UniwindListener.notify([
        ...orientationChanged ? [StyleDependency.Orientation] : [],
        StyleDependency.Dimensions,
    ])
})
