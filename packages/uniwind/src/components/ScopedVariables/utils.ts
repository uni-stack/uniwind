import { Logger } from '../../core/logger'
import type { CSSVariables, UniwindContextCSSVariables, UniwindContextType } from '../../core/types'

export type ScopedVariablesProps = {
    variables: CSSVariables
}

const validateVariables = (variables: CSSVariables) =>
    Object.fromEntries(
        Object.entries(variables).filter(([name]) => {
            if (!name.startsWith('--')) {
                if (__DEV__) {
                    Logger.error(`CSS variable name must start with "--", instead got: ${name}`)
                }

                return false
            }

            return true
        }),
    )

export const buildScopedVariablesContext = (
    parent: UniwindContextType,
    variables: CSSVariables,
): UniwindContextType => {
    // Merged with ancestors, nearest wins
    const mergedVariables = {
        ...parent.variables,
        ...validateVariables(variables),
    } as UniwindContextCSSVariables
    delete mergedVariables.__uniwindVariablesCacheKey
    const variablesCacheKey = JSON.stringify(
        Object.entries(mergedVariables).sort(([a], [b]) => a.localeCompare(b)),
    )
    mergedVariables.__uniwindVariablesCacheKey = variablesCacheKey

    return {
        ...parent,
        variables: mergedVariables,
    }
}
