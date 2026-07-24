import { Dimensions, Platform } from 'react-native'
import { Orientation, Platform as UniwindPlatform, StyleDependency, UNIWIND_PLATFORM_VARIABLES, UNIWIND_THEME_VARIABLES } from '../../common/consts'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'
import type { ComponentState, GenerateStyleSheetsCallback, RNStyle, Style, StyleSheets, ThemeName, UniwindContextType, Var, Vars } from '../types'
import { getScopedVars } from './native-utils'
import { parseBoxShadow, parseFontVariant, parseTextShadowMutation, parseTransformsMutation, resolveGradient } from './parsers'
import { UniwindRuntime } from './runtime'

type StylesResult = {
    styles: RNStyle
    dependencies: Array<StyleDependency>
    dependencySum: number
}

type StyleRegistration = {
    config: ReturnType<GenerateStyleSheetsCallback>
    owner: string
    themes: Array<string>
}

const emptyState: StylesResult = { styles: {}, dependencies: [], dependencySum: 0 }

class UniwindStoreBuilder {
    runtime = UniwindRuntime
    vars = {} as Record<ThemeName, Vars>
    private stylesheet = {} as StyleSheets
    private cache = {} as Record<ThemeName, Map<string, StylesResult>>
    private baseRegistration: StyleRegistration | null = null
    private remoteRegistrations = new Map<string, StyleRegistration>()
    private runtimeVariableOverrides = {} as Record<ThemeName, Vars>

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
        this.runtimeVariableOverrides = {}
        this.baseRegistration = {
            config: generateStyleSheetCallback(this.runtime),
            owner: 'host',
            themes,
        }
        this.rebuild()

        if (__DEV__ || this.remoteRegistrations.size > 0) {
            UniwindListener.notifyAll()
        }
    }

    updateCSSVariables = (theme: ThemeName, variables: Vars) => {
        this.runtimeVariableOverrides[theme] ??= {}
        Object.assign(this.runtimeVariableOverrides[theme], variables)
        this.vars[theme] ??= {}
        Object.assign(this.vars[theme], variables)
    }

    merge = (id: string, generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) => {
        const registration = {
            config: generateStyleSheetCallback(this.runtime),
            owner: id,
            themes,
        }

        this.remoteRegistrations.set(id, registration)
        this.rebuild()
        UniwindListener.notify([StyleDependency.Stylesheet, StyleDependency.Variables])

        return () => {
            if (this.remoteRegistrations.get(id) !== registration) {
                return
            }

            this.remoteRegistrations.delete(id)
            this.rebuild()
            UniwindListener.notify([StyleDependency.Stylesheet, StyleDependency.Variables])
        }
    }

    private rebuild() {
        const registrations = [
            ...(this.baseRegistration ? [this.baseRegistration] : []),
            ...this.remoteRegistrations.values(),
        ]
        const themes = this.baseRegistration?.themes ?? registrations[0]?.themes ?? []
        const stylesheet = {} as StyleSheets
        const vars = {} as Vars
        const scopedVars = {} as Partial<Record<string, Vars>>
        const classNameOwners = new Map<string, string>()
        const variableOwners = new Map<PropertyKey, string>()

        for (const registration of registrations) {
            for (const [className, styles] of Object.entries(registration.config.stylesheet)) {
                const existingOwner = classNameOwners.get(className)

                if (existingOwner !== undefined) {
                    if (__DEV__) {
                        Logger.warn(
                            `Federated class "${className}" from "${registration.owner}" was dropped because it is already registered by "${existingOwner}". Prefix remote class names to avoid conflicts.`,
                        )
                    }

                    continue
                }

                classNameOwners.set(className, registration.owner)
                stylesheet[className] = styles
            }

            const registrationVariableNames = new Set<PropertyKey>([
                ...Reflect.ownKeys(registration.config.vars),
                ...Object.values(registration.config.scopedVars).flatMap(value => value ? Reflect.ownKeys(value) : []),
            ])
            const acceptedVariableNames = new Set<PropertyKey>()

            for (const variableName of registrationVariableNames) {
                const existingOwner = variableOwners.get(variableName)

                if (existingOwner !== undefined) {
                    if (__DEV__) {
                        Logger.warn(
                            `Federated CSS variable "${
                                String(variableName)
                            }" from "${registration.owner}" was dropped because it is already registered by "${existingOwner}". Prefix remote CSS variables to avoid conflicts.`,
                        )
                    }

                    continue
                }

                variableOwners.set(variableName, registration.owner)
                acceptedVariableNames.add(variableName)
            }

            for (const variableName of acceptedVariableNames) {
                if (Object.hasOwn(registration.config.vars, variableName)) {
                    vars[variableName] = registration.config.vars[variableName]!
                }
            }

            for (const [scope, registrationVars] of Object.entries(registration.config.scopedVars)) {
                if (!registrationVars) {
                    continue
                }

                const targetVars = scopedVars[scope] ??= {}

                for (const variableName of acceptedVariableNames) {
                    if (Object.hasOwn(registrationVars, variableName)) {
                        targetVars[variableName] = registrationVars[variableName]!
                    }
                }
            }
        }

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

            const runtimeVariableOverrides = this.runtimeVariableOverrides[theme]

            if (runtimeVariableOverrides) {
                Object.assign(clonedVars, runtimeVariableOverrides)
            }

            return [theme, clonedVars]
        }))
        this.cache = Object.fromEntries(themes.map(theme => [theme, new Map()]))
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
        const dependencies = new Set<StyleDependency>([StyleDependency.Stylesheet])
        let dependencySum = 1 << StyleDependency.Stylesheet
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
