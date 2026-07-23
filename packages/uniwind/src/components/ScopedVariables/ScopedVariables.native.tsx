import React, { useMemo } from 'react'
import { UniwindContext, useUniwindContext } from '../../core/context'
import type { UniwindContextType } from '../../core/types'
import { buildScopedVariablesContext, type ScopedVariablesProps } from './utils'

export const ScopedVariables: React.FC<React.PropsWithChildren<ScopedVariablesProps>> = ({ variables, children }) => {
    const uniwindContext = useUniwindContext()
    const value = useMemo<UniwindContextType>(
        () => buildScopedVariablesContext(uniwindContext, variables),
        [uniwindContext, variables],
    )

    return (
        <UniwindContext.Provider value={value}>
            {children}
        </UniwindContext.Provider>
    )
}
