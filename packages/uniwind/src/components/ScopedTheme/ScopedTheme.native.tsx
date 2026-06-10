import React, { useMemo } from 'react'
import { UniwindContext, useUniwindContext } from '../../core/context'
import type { ThemeName, UniwindContextType } from '../../core/types'

type ScopedThemeProps = {
    theme: ThemeName
}

export const ScopedTheme: React.FC<React.PropsWithChildren<ScopedThemeProps>> = ({ theme, children }) => {
    const uniwindContext = useUniwindContext()
    const value = useMemo<UniwindContextType>(
        () => ({ ...uniwindContext, scopedTheme: theme }),
        [theme, uniwindContext],
    )

    return (
        <UniwindContext.Provider value={value}>
            {children}
        </UniwindContext.Provider>
    )
}
