import React, { useMemo } from 'react'
import { UniwindContext, useUniwindContext } from '../../core/context'
import type { UniwindContextType } from '../../core/types'
import { toWebValue } from '../../core/web/webUtils'
import { buildScopedVariablesContext, type ScopedVariablesProps } from './utils'

type CSSPropertiesWithVars = React.CSSProperties & { [key: `--${string}`]: string | undefined }

export const ScopedVariables: React.FC<React.PropsWithChildren<ScopedVariablesProps>> = ({ variables, children }) => {
    const uniwindContext = useUniwindContext()
    const value = useMemo<UniwindContextType>(
        () => buildScopedVariablesContext(uniwindContext, variables),
        [uniwindContext, variables],
    )
    // Inline custom properties so the DOM cascade resolves var(--name) for descendants
    const style = useMemo(() =>
        Object.entries(variables)
            .reduce<CSSPropertiesWithVars>((result, [name, variableValue]) => {
                if (name.startsWith('--')) {
                    result[name as `--${string}`] = toWebValue(variableValue)
                }

                return result
            }, { display: 'contents' }), [variables])

    return (
        <UniwindContext.Provider value={value}>
            <div style={style}>
                {children}
            </div>
        </UniwindContext.Provider>
    )
}
