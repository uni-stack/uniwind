import { UniwindRuntime, UniwindStore } from '../../core/native'
import { UniwindContextType } from '../../core/types'

export const getVariableValue = (name: string, uniwindContext: UniwindContextType) =>
    UniwindStore.vars[uniwindContext.scopedTheme ?? UniwindRuntime.currentThemeName]?.[name]
