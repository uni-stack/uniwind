import { StyleDependency } from '../../types'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'
import { CSSVariables, ThemeName } from '../types'
import { UniwindConfigBuilder as UniwindConfigBuilderBase } from './config.common'

class UniwindConfigBuilder extends UniwindConfigBuilderBase {
    private runtimeCSSVariables = new Map<ThemeName, CSSVariables>()

    constructor() {
        super()
    }

    updateCSSVariables(theme: ThemeName, variables: CSSVariables) {
        Object.entries(variables).forEach(([varName, varValue]) => {
            if (!varName.startsWith('--') && __DEV__) {
                Logger.error(`CSS variable name must start with "--", instead got: ${varName}`)

                return
            }

            const runtimeCSSVariables = this.runtimeCSSVariables.get(theme) ?? {}

            runtimeCSSVariables[varName] = varValue
            this.runtimeCSSVariables.set(theme, runtimeCSSVariables)
            this.applyCSSVariable(varName, varValue)
        })

        if (theme === this.currentTheme) {
            UniwindListener.notify([StyleDependency.Variables])
        }
    }

    protected onThemeChange() {
        if (typeof document === 'undefined') {
            return
        }

        document.documentElement.removeAttribute('style')

        const runtimeCSSVariables = this.runtimeCSSVariables.get(this.currentTheme)

        if (!runtimeCSSVariables) {
            return
        }

        Object.entries(runtimeCSSVariables).forEach(([varName, varValue]) => {
            this.applyCSSVariable(varName, varValue)
        })
    }

    private applyCSSVariable(varName: keyof CSSVariables, varValue: CSSVariables[keyof CSSVariables]) {
        if (typeof document === 'undefined') {
            return
        }

        document.documentElement.style.setProperty(
            varName,
            typeof varValue === 'number' ? `${varValue}px` : varValue,
        )
    }
}

export const Uniwind = new UniwindConfigBuilder()
