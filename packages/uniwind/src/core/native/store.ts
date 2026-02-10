/* eslint-disable max-depth */
import { Dimensions, Platform } from 'react-native'
import { Orientation, StyleDependency } from '../../types'
import { UniwindListener } from '../listener'
import { ComponentState, CSSVariables, GenerateStyleSheetsCallback, RNStyle, Style, StyleSheets, ThemeName } from '../types'
import { cloneWithAccessors } from './native-utils'
import { parseBoxShadow, parseFontVariant, parseTextShadowMutation, parseTransformsMutation, resolveGradient } from './parsers'
import { UniwindRuntime } from './runtime'

type StylesResult = {
    styles: RNStyle
    dependencies: Array<StyleDependency>
    dependencySum: number
    hasDataAttributes: boolean
}

const emptyState: StylesResult = { styles: {}, dependencies: [], dependencySum: 0, hasDataAttributes: false }

class UniwindStoreBuilder {
    runtime = UniwindRuntime
    vars = {} as Record<string, unknown>
    runtimeThemeVariables = new Map<ThemeName, CSSVariables>()
    private stylesheet = {} as StyleSheets
    private cache = new Map<string, StylesResult>()
    private generateStyleSheetCallbackResult: ReturnType<GenerateStyleSheetsCallback> | null = null

    getStyles(className: string | undefined, componentProps?: Record<string, any>, state?: ComponentState): StylesResult {
        if (className === undefined || className === '') {
            return emptyState
        }

        const stateFlags = (state ? 8 : 0)
            | (state?.isDisabled ? 4 : 0)
            | (state?.isFocused ? 2 : 0)
            | (state?.isPressed ? 1 : 0)
        const cacheKey = `${className}:${stateFlags}`

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!
        }

        const result = this.resolveStyles(className, componentProps, state)

        // Don't cache styles that depend on data attributes
        if (!result.hasDataAttributes) {
            this.cache.set(cacheKey, result)
            UniwindListener.subscribe(
                () => this.cache.delete(cacheKey),
                result.dependencies,
                { once: true },
            )
        }

        return result
    }

    reinit = (generateStyleSheetCallback?: GenerateStyleSheetsCallback) => {
        const config = generateStyleSheetCallback?.(this.runtime) ?? this.generateStyleSheetCallbackResult

        if (!config) {
            return
        }

        const { scopedVars, stylesheet, vars } = config

        this.generateStyleSheetCallbackResult = config
        this.stylesheet = stylesheet
        this.vars = vars

        const themeVars = scopedVars[`__uniwind-theme-${this.runtime.currentThemeName}`]
        const platformVars = scopedVars[`__uniwind-platform-${Platform.OS}`]
        const runtimeThemeVars = this.runtimeThemeVariables.get(this.runtime.currentThemeName)

        if (themeVars) {
            Object.defineProperties(this.vars, Object.getOwnPropertyDescriptors(themeVars))
        }

        if (platformVars) {
            Object.defineProperties(this.vars, Object.getOwnPropertyDescriptors(platformVars))
        }

        if (runtimeThemeVars) {
            Object.defineProperties(this.vars, Object.getOwnPropertyDescriptors(runtimeThemeVars))
        }

        if (__DEV__ && generateStyleSheetCallback) {
            UniwindListener.notifyAll()
        }
    }

    private resolveStyles(classNames: string, componentProps?: Record<string, any>, state?: ComponentState) {
        const result = {} as Record<string, any>
        let vars = this.vars
        let hasDataAttributes = false
        const dependencies = new Set<StyleDependency>()
        let dependencySum = 0
        const bestBreakpoints = new Map<string, Style>()

        for (const className of classNames.split(' ')) {
            if (!(className in this.stylesheet)) {
                continue
            }

            for (const style of this.stylesheet[className] as Array<Style>) {
                if (style.dependencies) {
                    style.dependencies.forEach(dep => {
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
                    || (style.theme !== null && this.runtime.currentThemeName !== style.theme)
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
                        if (vars === this.vars) {
                            vars = cloneWithAccessors(this.vars)
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
