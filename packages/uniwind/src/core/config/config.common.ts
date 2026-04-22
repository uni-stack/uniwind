import { Appearance, Insets, Platform } from 'react-native'
import { ColorScheme, StyleDependency } from '../../types'
import { UniwindListener } from '../listener'
import { CSSVariables, GenerateStyleSheetsCallback, ThemeName } from '../types'

const SYSTEM_THEME = 'system' as const
// Platform.constants is not defined in RNW
const RN_VERSION = Platform.constants?.reactNativeVersion?.minor ?? 0
const UNSPECIFIED_THEME = RN_VERSION >= 82 ? 'unspecified' : undefined

export class UniwindConfigBuilder {
    protected _themes = ['light', 'dark']
    #hasAdaptiveThemes = true
    #currentTheme = this.colorScheme as ThemeName

    constructor() {
        Appearance.addChangeListener(event => {
            const colorScheme = event.colorScheme === 'unspecified'
                ? ColorScheme.Light
                : event.colorScheme ?? ColorScheme.Light
            const prevTheme = this.#currentTheme

            if (this.#hasAdaptiveThemes && prevTheme !== colorScheme) {
                this.#currentTheme = colorScheme
                this.onThemeChange()
                UniwindListener.notify([StyleDependency.Theme])
            }
        })
    }

    get themes() {
        return this._themes as Array<ThemeName>
    }

    get hasAdaptiveThemes() {
        return this.#hasAdaptiveThemes
    }

    get currentTheme(): ThemeName {
        return this.#currentTheme
    }

    private get colorScheme() {
        const colorScheme = Appearance.getColorScheme()

        if (colorScheme === 'unspecified') {
            return ColorScheme.Light
        }

        return colorScheme ?? ColorScheme.Light
    }

    // oxlint-disable-next-line typescript/no-redundant-type-constituents
    setTheme(theme: ThemeName | typeof SYSTEM_THEME) {
        const prevTheme = this.#currentTheme
        const prevHasAdaptiveThemes = this.#hasAdaptiveThemes
        const isAdaptiveTheme = ['light', 'dark'].includes(theme)

        try {
            if (theme === SYSTEM_THEME) {
                this.#hasAdaptiveThemes = true
                this.#currentTheme = this.colorScheme

                if (Platform.OS !== 'web') {
                    // @ts-expect-error RN >0.82 - breaking change
                    Appearance.setColorScheme(UNSPECIFIED_THEME)
                }

                return
            }

            if (!this._themes.includes(theme)) {
                throw new Error(`Uniwind: You're trying to setTheme to '${theme}', but it was not registered.`)
            }

            this.#hasAdaptiveThemes = false
            this.#currentTheme = theme

            if (Platform.OS !== 'web') {
                Appearance.setColorScheme(
                    // @ts-expect-error RN >0.82 - breaking change
                    isAdaptiveTheme
                        ? this.#currentTheme as ColorScheme
                        : UNSPECIFIED_THEME,
                )
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

    // oxlint-disable-next-line typescript/no-unused-vars
    updateCSSVariables(theme: ThemeName, cssVariables: CSSVariables) {
        // noop
    }

    // oxlint-disable-next-line typescript/no-unused-vars
    updateInsets(insets: Insets) {
        // noop
    }

    protected __reinit(_: GenerateStyleSheetsCallback, themes: Array<string>) {
        this._themes = themes
    }

    protected onThemeChange() {
        // noop
    }
}

export const Uniwind = new UniwindConfigBuilder()
