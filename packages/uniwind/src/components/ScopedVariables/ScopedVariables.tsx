import React, { useMemo } from 'react'
import { UniwindContext, useUniwindContext } from '../../core/context'
import type { UniwindContextType } from '../../core/types'
import { toWebValue } from '../../core/web/webUtils'
import { buildScopedVariablesContext, type ScopedVariablesProps } from './utils'

export const ScopedVariables: React.FC<React.PropsWithChildren<ScopedVariablesProps>> = ({ variables, children }) => {
    const uniwindContext = useUniwindContext()
    const value = useMemo<UniwindContextType>(
        () => buildScopedVariablesContext(uniwindContext, variables),
        [uniwindContext, variables],
    )
    // Inline custom properties so the DOM cascade resolves var(--name) for descendants
    const style = useMemo<React.CSSProperties>(() => {
        const result: Record<string, string | number> = { display: 'contents' }

        Object.entries(variables).forEach(([name, variableValue]) => {
            if (name.startsWith('--')) {
                result[name] = toWebValue(variableValue)
            }
        })

        return result as React.CSSProperties
    }, [variables])

    return (
        <div style={style}>
            <UniwindContext.Provider value={value}>
                {children}
            </UniwindContext.Provider>
        </div>
    )
}
