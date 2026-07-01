import { Dimensions, Platform } from 'react-native'
import { Orientation, Platform as UniwindPlatform, StyleDependency, UNIWIND_PLATFORM_VARIABLES, UNIWIND_THEME_VARIABLES } from '../../common/consts'
import { UniwindListener } from '../listener'
import type { ComponentState, GenerateStyleSheetsCallback, RNStyle, Style, StyleSheets, ThemeName, UniwindContextType, Var, Vars } from '../types'
import { createVarGetter } from './native-utils'
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
    vars = {} as Record<ThemeName, Vars>
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

        const isScopedTheme = uniwindContext.scopedTheme !== null
        // Subtrees with scoped variables (<ScopedVariables>) bypass the cache
        // entirely. Keying the cache on the variable map would require
        // serializing it on every resolve (expensive) and would bloat the
        // cache with per-subtree entries, so we recompute instead.
        const hasScopedVariables = uniwindContext.variables !== null
        const cacheKey = `${className}${state?.isDisabled ?? false}${state?.isFocused ?? false}${state?.isPressed ?? false}${isScopedTheme}${
            uniwindContext.rtl ?? ''
        }`
        const cache = this.cache[uniwindContext.scopedTheme ?? this.runtime.currentThemeName]

        if (!cache) {
            return emptyState
        }

        if (!hasScopedVariables && cache.has(cacheKey)) {
            return cache.get(cacheKey)!
        }

        const result = this.resolveStyles(className, componentProps, state, uniwindContext)

        // Don't cache styles that depend on data attributes or scoped variables
        if (!hasScopedVariables && !result.hasDataAttributes) {
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
        const platform = this.getCurrentPlatform()
        const commonPlatform = platform.includes('tv') ? UniwindPlatform.TV : UniwindPlatform.Native
        const commonPlatformVars = scopedVars[`${UNIWIND_PLATFORM_VARIABLES}${commonPlatform}`]
        const platformVars = scopedVars[`${UNIWIND_PLATFORM_VARIABLES}${platform}`]

        if (commonPlatformVars) {
            Object.assign(vars, commonPlatformVars)
        }

        if (platformVars) {
            Object.assign(vars, platformVars)
        }

        this.stylesheet = stylesheet
        this.vars = Object.fromEntries(themes.map(theme => {
            const clonedVars = Object.create(vars) as Vars
            const themeVars = scopedVars[`${UNIWIND_THEME_VARIABLES}${theme}`]

            if (themeVars) {
                Object.assign(clonedVars, themeVars)
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
        const resultGetters = {} as Record<string, Var>
        const theme = uniwindContext.scopedTheme ?? this.runtime.currentThemeName
        // At this point we're sure that theme is correct
        const themeVars = this.vars[theme]!
        // Overlay scoped variables (from <ScopedVariables>) onto the theme vars.
        // We clone via the prototype chain so theme defaults still resolve for
        // any variable the subtree didn't override, and so getters that read
        // other variables (custom property references) see the overrides too.
        let vars = uniwindContext.variables === null
            ? themeVars
            : Object.assign(
                Object.create(themeVars) as Vars,
                Object.fromEntries(
                    Object.entries(uniwindContext.variables).map(([name, value]) => [name, createVarGetter(value)]),
                ),
            )
        const originalVars = vars
        let hasDataAttributes = false
        const dependencies = new Set<StyleDependency>()
        let dependencySum = 0
        const bestBreakpoints = new Map<string, Style>()
        const isScopedTheme = uniwindContext.scopedTheme !== null
        const classNameTokens = classNames.includes('\n')
            ? classNames.split(/\s+/).filter(Boolean)
            : classNames.split(' ')

        for (const className of classNameTokens) {
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
                    || (style.rtl !== null && !this.validateDir(style.rtl, uniwindContext))
                    || (style.active !== null && state?.isPressed !== style.active)
                    || (style.focus !== null && state?.isFocused !== style.focus)
                    || (style.disabled !== null && state?.isDisabled !== style.disabled)
                    || (style.dataAttributes !== null && !this.validateDataAttributes(style.dataAttributes, componentProps))
                ) {
                    continue
                }

                for (const [property, valueGetter] of style.entries) {
                    const previousBest = bestBreakpoints.get(property)

                    if (previousBest) {
                        const previousWins = previousBest.minWidth > style.minWidth
                            || previousBest.complexity > style.complexity
                            || (
                                previousBest.complexity === style.complexity
                                && previousBest.importantProperties.includes(property)
                            )

                        if (previousWins) {
                            continue
                        }
                    }

                    if (property[0] === '-') {
                        // Clone vars object if we are adding inline variables
                        if (vars === originalVars) {
                            vars = Object.create(originalVars)
                        }

                        vars[property] = valueGetter
                    } else {
                        resultGetters[property] = valueGetter
                    }

                    bestBreakpoints.set(property, style)
                }
            }
        }

        const result = Object.fromEntries(
            Object.entries(resultGetters).map(([property, valueGetter]) => [property, valueGetter(vars)]),
        ) as Record<string, any>

        if (result.lineHeight !== undefined && result.lineHeight < 6) {
            result.lineHeight *= result.fontSize
        }

        if (result.boxShadow !== undefined) {
            result.boxShadow = parseBoxShadow(result.boxShadow)
        }

        if (result.visibility === 'hidden') {
            result.display = 'none'
        }

        if (
            result.borderStyle !== undefined && result.borderColor === undefined
        ) {
            result.borderColor = '#000000'
        }

        if (
            result.outlineStyle !== undefined && result.outlineColor === undefined
        ) {
            result.outlineColor = '#000000'
        }

        if (result.fontVariant !== undefined) {
            result.fontVariant = parseFontVariant(result.fontVariant)
        }

        parseTransformsMutation(result)

        if (result.experimental_backgroundImage !== undefined) {
            result.experimental_backgroundImage = resolveGradient(result.experimental_backgroundImage)
        }

        if (result.textShadow !== undefined) {
            parseTextShadowMutation(result)
        }

        return {
            styles: result,
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

    private validateDir(rtl: boolean, uniwindContext: UniwindContextType) {
        if (uniwindContext.rtl !== null) {
            return rtl === uniwindContext.rtl
        }

        return rtl === this.runtime.rtl
    }

    private getCurrentPlatform() {
        const platform = Platform.OS

        if (platform === 'android') {
            return Platform.isTV ? UniwindPlatform.AndroidTV : UniwindPlatform.Android
        }

        if (platform === 'ios') {
            return Platform.isTV ? UniwindPlatform.AppleTV : UniwindPlatform.iOS
        }

        return platform
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
