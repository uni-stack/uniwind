import React, { useMemo } from 'react'
import { UniwindContext, useUniwindContext } from '../../core/context'
import { Logger } from '../../core/logger'
import type { CSSVariables, UniwindContextType } from '../../core/types'

type ScopedVariablesProps = {
    variables: CSSVariables
}

const validateVariables = (variables: CSSVariables) => {
    if (!__DEV__) {
        return variables
    }

    return Object.fromEntries(
        Object.entries(variables).filter(([name]) => {
            if (!name.startsWith('--')) {
                Logger.error(`CSS variable name must start with "--", instead got: ${name}`)

                return false
            }

            return true
        }),
    )
}

export const ScopedVariables: React.FC<React.PropsWithChildren<ScopedVariablesProps>> = ({ variables, children }) => {
    const uniwindContext = useUniwindContext()
    const value = useMemo<UniwindContextType>(
        () => ({
            ...uniwindContext,
            // Nested providers extend their ancestors: a deep child sees the
            // merge of every ancestor's variables, with the nearest provider
            // winning on conflicts.
            variables: {
                ...uniwindContext.variables,
                ...validateVariables(variables),
            },
        }),
        [uniwindContext, variables],
    )

    return (
        <div style={{ display: 'contents' }}>
            <UniwindContext.Provider value={value}>
                {children}
            </UniwindContext.Provider>
        </div>
    )
}
