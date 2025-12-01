import { Appearance, Platform } from 'react-native'
import { ColorScheme, StyleDependency, UniwindConfig } from '../../types'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'

type UserThemes = UniwindConfig extends { themes: infer T extends ReadonlyArray<string> } ? T
    : ReadonlyArray<string>

export type ThemeName = UserThemes[number]

const SYSTEM_THEME = 'system' as const

export class UniwindConfigBuilder {
    private themes = ['light', 'dark']
    private runtimeCSSVariables = new Set<string>()
    #hasAdaptiveThemes = true
    #currentTheme = this.colorScheme as ThemeName

    constructor() {
        Appearance.addChangeListener(event => {
            const colorScheme = event.colorScheme ?? ColorScheme.Light
            const prevTheme = this.#currentTheme

            if (this.#hasAdaptiveThemes && prevTheme !== colorScheme) {
                this.#currentTheme = colorScheme
                this.onThemeChange()
                UniwindListener.notify([StyleDependency.Theme])
            }
        })
    }

    get hasAdaptiveThemes() {
        return this.#hasAdaptiveThemes
    }

    get currentTheme(): ThemeName {
        return this.#currentTheme
    }

    private get colorScheme() {
        return Appearance.getColorScheme() ?? ColorScheme.Light
    }

    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    setTheme(theme: ThemeName | typeof SYSTEM_THEME) {
        const prevTheme = this.#currentTheme
        const prevHasAdaptiveThemes = this.#hasAdaptiveThemes
        const isAdaptiveTheme = ['light', 'dark'].includes(theme)

        try {
            if (theme === SYSTEM_THEME) {
                this.#hasAdaptiveThemes = true
                this.#currentTheme = this.colorScheme

                if (Platform.OS !== 'web') {
                    Appearance.setColorScheme(undefined)
                }

                return
            }

            if (!this.themes.includes(theme)) {
                throw new Error(`Uniwind: You're trying to setTheme to '${theme}', but it was not registered.`)
            }

            this.#hasAdaptiveThemes = false
            this.#currentTheme = theme

            if (Platform.OS !== 'web') {
                Appearance.setColorScheme(isAdaptiveTheme ? this.#currentTheme as ColorScheme : undefined)
            }
        } finally {
            if (prevTheme !== this.#currentTheme || this.runtimeCSSVariables.size > 0) {
                this.onThemeChange()
                UniwindListener.notify([StyleDependency.Theme])
            }

            if (prevHasAdaptiveThemes !== this.#hasAdaptiveThemes) {
                UniwindListener.notify([StyleDependency.AdaptiveThemes])
            }
        }
    }

    setCSSVariables(variables: Record<string, string | number>) {
        Object.entries(variables).forEach(([varName, varValue]) => {
            if (!varName.startsWith('--') && __DEV__) {
                Logger.error(`CSS variable name must start with "--", instead got: ${varName}`)

                return
            }

            if (Platform.OS !== 'web' || typeof document === 'undefined') {
                return
            }

            this.runtimeCSSVariables.add(varName)
            document.documentElement.style.setProperty(
                varName,
                typeof varValue === 'number' ? `${varValue}px` : varValue,
            )
        })

        UniwindListener.notify([StyleDependency.Theme])
    }

    private __reinit(themes: Array<string>) {
        this.themes = themes
    }

    private onThemeChange() {
        this.runtimeCSSVariables.forEach(varName => {
            if (Platform.OS !== 'web' || typeof document === 'undefined') {
                return
            }

            document.documentElement.style.removeProperty(varName)
        })
        this.runtimeCSSVariables.clear()
    }
}

export const Uniwind = new UniwindConfigBuilder()
