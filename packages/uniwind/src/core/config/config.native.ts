import { formatHex, formatHex8, parse } from 'culori'
import { StyleDependency } from '../../types'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'
import { UniwindStore } from '../native'
import { GenerateStyleSheetsCallback } from '../types'
import { UniwindConfigBuilder as UniwindConfigBuilderBase } from './config.common'

class UniwindConfigBuilder extends UniwindConfigBuilderBase {
    constructor() {
        super()
    }

    // @ts-expect-error Overriding protected method
    __reinit(generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) {
        // @ts-expect-error Accessing protected method
        super.__reinit(themes)
        UniwindStore.reinit(generateStyleSheetCallback)
    }

    onThemeChange() {
        UniwindStore.runtime.currentThemeName = this.currentTheme
        UniwindStore.reinit()
        // @ts-expect-error Accessing protected property
        this.runtimeCSSVariables.clear()
    }

    setCSSVariables(variables: Record<string, string | number>) {
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

            Object.defineProperty(UniwindStore.vars, varName, {
                configurable: true,
                enumerable: true,
                get: () => value,
            })
            // @ts-expect-error Accessing protected property
            this.runtimeCSSVariables.add(varName)
        })
        UniwindListener.notify([StyleDependency.Theme])
    }
}

export const Uniwind = new UniwindConfigBuilder()
