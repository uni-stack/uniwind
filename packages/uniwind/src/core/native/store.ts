import { Dimensions, Platform } from 'react-native'
import { Orientation, Platform as UniwindPlatform, StyleDependency, UNIWIND_PLATFORM_VARIABLES, UNIWIND_THEME_VARIABLES } from '../../common/consts'
import { coversAnyLonghand, SHORTHAND_ROLES } from '../../uniparser/src/common/shorthands'
import {
    applyShorthandsMutation,
    deleteUnsetStylesMutation,
    ONE_VALUE,
    parseBoxShadow,
    parseFilter,
    parseFontVariant,
    parseFontVariationSettings,
    parseTextShadowMutation,
    parseTransformsMutation,
    readShorthandEntries,
    type ResolvedShorthand,
    resolveGradient,
    resolveLineHeightMutation,
    resolveLineStylesMutation,
    resolveVisibilityMutation,
    toGuardedStyle,
} from '../../uniparser/src/core/native/parsers'
import { UniwindListener } from '../listener'
import type { ComponentState, GenerateStyleSheetsCallback, RNStyle, Style, StyleSheets, ThemeName, UniwindContextType, Var, Vars } from '../types'
import { getScopedVars } from './native-utils'
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
        const cacheKey = `${className}${state?.isDisabled ?? false}${state?.isFocused ?? false}${state?.isPressed ?? false}${isScopedTheme}${
            uniwindContext.rtl ?? ''
        }${uniwindContext.variables?.__uniwindVariablesCacheKey ?? ''}`
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
        // Overlay scoped variables onto a prototype-chained clone so unset vars fall through to the theme
        let vars = uniwindContext.variables === null
            ? themeVars
            : Object.assign(
                Object.create(themeVars) as Vars,
                getScopedVars(uniwindContext.variables),
            )
        const originalVars = vars
        let hasDataAttributes = false
        const dependencies = new Set<StyleDependency>()
        let dependencySum = 0
        const bestRanks = new Map<string, number>()
        let shorthandBits = 0
        let coveredBits = 0
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

                if (style.hasDataAttributes) {
                    hasDataAttributes = true
                }

                if (!style.matches(this.runtime, uniwindContext, componentProps, state, vars)) {
                    continue
                }

                for (const [property, valueGetter] of style.entries) {
                    const rank = style.importantProperties.includes(property) ? style.importantComplexity : style.complexity
                    const previousRank = bestRanks.get(property)

                    if (previousRank !== undefined && previousRank > rank) {
                        continue
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

                    bestRanks.set(property, rank)
                    const role = SHORTHAND_ROLES.get(property)

                    if (role !== undefined) {
                        shorthandBits |= role.bit
                        coveredBits |= role.coveredBy
                    }
                }
            }
        }

        const result = {} as Record<string, any>
        const shorthands: Array<ResolvedShorthand> = []
        const hasShorthandOverLonghand = (shorthandBits & coveredBits) !== 0

        for (const [property, valueGetter] of Object.entries(resultGetters)) {
            const value = valueGetter(vars)
            const entries = readShorthandEntries(property, value, vars)

            if (entries === null || entries === ONE_VALUE) {
                result[property] = toGuardedStyle(property, value)
            }

            // a one-value shorthand only removes longhands, so it is applied only when the class resolves one it covers
            if (entries !== null && (entries !== ONE_VALUE || (hasShorthandOverLonghand && coversAnyLonghand(property, coveredBits)))) {
                shorthands.push({ property, rank: bestRanks.get(property) ?? 0, entries })
            }
        }

        if (shorthands.length > 0) {
            applyShorthandsMutation(result, shorthands, bestRanks)
        }

        resolveLineHeightMutation(result)
        resolveLineStylesMutation(result)

        if (typeof result.boxShadow === 'string') {
            result.boxShadow = parseBoxShadow(result.boxShadow)
        }

        if (typeof result.filter === 'string') {
            result.filter = parseFilter(result.filter)
        }

        resolveVisibilityMutation(result)

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

        if (typeof result.fontVariant === 'string') {
            result.fontVariant = parseFontVariant(result.fontVariant)
        }

        if (typeof result.fontVariationSettings === 'string') {
            result.fontVariationSettings = parseFontVariationSettings(result.fontVariationSettings)
        }

        parseTransformsMutation(result)

        if (typeof result.experimental_backgroundImage === 'string') {
            result.experimental_backgroundImage = resolveGradient(result.experimental_backgroundImage)
        }

        if (Object.hasOwn(result, 'textShadow')) {
            parseTextShadowMutation(result, vars)
        }

        deleteUnsetStylesMutation(result)

        return {
            styles: result,
            dependencies: Array.from(dependencies),
            dependencySum,
            hasDataAttributes,
        }
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

Dimensions.addEventListener('change', ({ window }: { window: ReturnType<typeof Dimensions.get> }) => {
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
