import React, { useMemo } from 'react'
import { UniwindContext, useUniwindContext } from '../../core/context'
import type { UniwindContextType } from '../../core/types'
import { buildScopedVariablesContext, type ScopedVariablesProps } from './utils'

export const ScopedVariables: React.FC<React.PropsWithChildren<ScopedVariablesProps>> = ({ variables, cacheKey, children }) => {
    const uniwindContext = useUniwindContext()
    const value = useMemo<UniwindContextType>(
        () => buildScopedVariablesContext(uniwindContext, variables, cacheKey),
        [uniwindContext, variables, cacheKey],
    )

    // Apply the overrides as inline custom properties on the wrapper so the DOM
    // cascade resolves `var(--name)` to the scoped value for every descendant.
    // Custom properties inherit through `display: contents`, so children still
    // pick these up even though the wrapper generates no box. Numbers are
    // converted to px, matching `Uniwind.updateCSSVariables` on web.
    const style = useMemo<React.CSSProperties>(() => {
        const result: Record<string, string | number> = { display: 'contents' }

        for (const [name, variableValue] of Object.entries(variables)) {
            if (!name.startsWith('--')) {
                continue
            }

            result[name] = typeof variableValue === 'number' ? `${variableValue}px` : variableValue
        }

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
