import type { Insets } from 'react-native'
import { StyleDependency } from '../../common/consts'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'
import { UniwindStore } from '../native'
import { createVarGetter } from '../native/native-utils'
import type { CSSVariables, GenerateStyleSheetsCallback, ThemeName } from '../types'
import { UniwindConfigBuilder as UniwindConfigBuilderBase } from './config.common'

class UniwindConfigBuilder extends UniwindConfigBuilderBase {
    constructor() {
        super()
    }

    updateCSSVariables(theme: ThemeName, variables: CSSVariables) {
        Object.entries(variables).forEach(([varName, varValue]) => {
            if (!varName.startsWith('--') && __DEV__) {
                Logger.error(`CSS variable name must start with "--", instead got: ${varName}`)

                return
            }

            UniwindStore.vars[theme] ??= {}
            UniwindStore.vars[theme][varName] = createVarGetter(varValue)
        })

        UniwindListener.notify([StyleDependency.Variables])
    }

    updateInsets(insets: Insets) {
        UniwindStore.runtime.insets.bottom = insets.bottom ?? 0
        UniwindStore.runtime.insets.top = insets.top ?? 0
        UniwindStore.runtime.insets.left = insets.left ?? 0
        UniwindStore.runtime.insets.right = insets.right ?? 0
        UniwindListener.notify([StyleDependency.Insets])
    }

    protected __reinit(generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) {
        super.__reinit(generateStyleSheetCallback, themes)
        UniwindStore.reinit(generateStyleSheetCallback, themes)
    }

    protected onThemeChange() {
        UniwindStore.runtime.currentThemeName = this.currentTheme
    }
}

export const Uniwind = new UniwindConfigBuilder()
