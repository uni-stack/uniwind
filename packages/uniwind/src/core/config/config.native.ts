import type { Insets } from 'react-native'
import { StyleDependency } from '../../common/consts'
import { arrayEquals } from '../../common/utils'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'
import { UniwindStore } from '../native'
import { createVarGetter } from '../native/native-utils'
import type { CSSVariables, GenerateStyleSheetsCallback, ThemeName, Vars } from '../types'
import { UniwindConfigBuilder as UniwindConfigBuilderBase } from './config.common'

class UniwindConfigBuilder extends UniwindConfigBuilderBase {
    constructor() {
        super()
    }

    updateCSSVariables(theme: ThemeName, variables: CSSVariables) {
        const runtimeVars = {} as Vars

        Object.entries(variables).forEach(([varName, varValue]) => {
            if (!varName.startsWith('--') && __DEV__) {
                Logger.error(`CSS variable name must start with "--", instead got: ${varName}`)

                return
            }

            runtimeVars[varName] = createVarGetter(varValue)
        })

        UniwindStore.updateCSSVariables(theme, runtimeVars)
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

    protected __mergeStyles(id: string, generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) {
        if (!arrayEquals(themes, this._themes)) {
            throw new Error(`Uniwind: Federated styles '${id}' must use the host themes.`)
        }

        return UniwindStore.merge(id, generateStyleSheetCallback, themes)
    }

    protected onThemeChange() {
        UniwindStore.runtime.currentThemeName = this.currentTheme
    }
}

export const Uniwind = new UniwindConfigBuilder()
