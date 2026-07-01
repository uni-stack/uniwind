import { UniwindRuntime, UniwindStore } from '../../core/native'
import { createVarGetter } from '../../core/native/native-utils'
import type { UniwindContextType, Vars } from '../../core/types'

export const getVariableValue = (name: string, uniwindContext: UniwindContextType) => {
    const themeVars = UniwindStore.vars[uniwindContext.scopedTheme ?? UniwindRuntime.currentThemeName]

    if (!themeVars) {
        return undefined
    }

    // Overlay scoped variables from <ScopedVariables> on top of theme vars.
    const vars: Vars = uniwindContext.variables === null
        ? themeVars
        : Object.assign(
            Object.create(themeVars) as Vars,
            Object.fromEntries(
                Object.entries(uniwindContext.variables).map(([varName, value]) => [varName, createVarGetter(value)]),
            ),
        )

    return vars[name]?.(vars)
}
