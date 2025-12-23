import { formatHex, formatHex8, parse } from 'culori'
import { Insets } from 'react-native'
import { StyleDependency } from '../../types'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'
import { UniwindStore } from '../native'
import { CSSVariables, GenerateStyleSheetsCallback, ThemeName } from '../types'
import { UniwindConfigBuilder as UniwindConfigBuilderBase } from './config.common'

class UniwindConfigBuilder extends UniwindConfigBuilderBase {
    constructor() {
        super()
    }

    __reinit(generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) {
        super.__reinit(generateStyleSheetCallback, themes)
        UniwindStore.reinit(generateStyleSheetCallback)
    }

    onThemeChange() {
        UniwindStore.runtime.currentThemeName = this.currentTheme
        UniwindStore.reinit()
    }

    updateCSSVariables(theme: ThemeName, variables: CSSVariables) {
        Object.entries(variables).forEach(([varName, varValue]) => {
            if (!varName.startsWith('--') && __DEV__) {
                Logger.error(`CSS variable name must start with "--", instead got: ${varName}`)

                return
            }

            const getValue = () => {
                if (typeof varValue === 'number') {
                    return varValue
                }

                const parsedColor = parse(varValue)

                if (parsedColor) {
                    return parsedColor.alpha === undefined || parsedColor.alpha === 1
                        ? formatHex(parsedColor)
                        : formatHex8(parsedColor)
                }

                return varValue
            }

            const value = getValue()
            const runtimeThemeVariables = UniwindStore.runtimeThemeVariables.get(theme) ?? {}

            Object.defineProperty(UniwindStore.vars, varName, {
                configurable: true,
                enumerable: true,
                get: () => value,
            })
            Object.defineProperty(runtimeThemeVariables, varName, {
                configurable: true,
                enumerable: true,
                get: () => value,
            })
            UniwindStore.runtimeThemeVariables.set(theme, runtimeThemeVariables)
        })

        if (theme === this.currentTheme) {
            UniwindListener.notify([StyleDependency.Variables])
        }
    }

    updateInsets(insets: Insets) {
        UniwindStore.runtime.insets.bottom = insets.bottom ?? 0
        UniwindStore.runtime.insets.top = insets.top ?? 0
        UniwindStore.runtime.insets.left = insets.left ?? 0
        UniwindStore.runtime.insets.right = insets.right ?? 0
        UniwindListener.notify([StyleDependency.Insets])
    }
}

export const Uniwind = new UniwindConfigBuilder()
