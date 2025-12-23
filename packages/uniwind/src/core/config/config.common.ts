import { Appearance, Insets, Platform } from 'react-native'
import { ColorScheme, StyleDependency } from '../../types'
import { UniwindListener } from '../listener'
import { CSSVariables, GenerateStyleSheetsCallback, ThemeName } from '../types'

const SYSTEM_THEME = 'system' as const

export class UniwindConfigBuilder {
    protected themes = ['light', 'dark']
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
            if (prevTheme !== this.#currentTheme) {
                this.onThemeChange()
                UniwindListener.notify([StyleDependency.Theme])
            }

            if (prevHasAdaptiveThemes !== this.#hasAdaptiveThemes) {
                UniwindListener.notify([StyleDependency.AdaptiveThemes])
            }
        }
    }

    updateCSSVariables(theme: ThemeName, variables: CSSVariables) {
        // noop
        theme
        variables
    }

    updateInsets(insets: Insets) {
        // noop
        insets
    }

    protected __reinit(_: GenerateStyleSheetsCallback, themes: Array<string>) {
        this.themes = themes
    }

    protected onThemeChange() {
        // noop
    }
}

export const Uniwind = new UniwindConfigBuilder()
