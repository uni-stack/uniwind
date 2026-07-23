import { Logger } from '../../core/logger'
import type { CSSVariables, UniwindContextType } from '../../core/types'

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
    }
    const variablesCacheKey = Object
        .entries(mergedVariables)
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((acc, [key, value]) => `${acc}${key}:${value};`, '')

    return {
        ...parent,
        variables: mergedVariables,
        variablesCacheKey,
    }
}
