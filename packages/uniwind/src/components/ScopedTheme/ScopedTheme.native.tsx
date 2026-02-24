import React, { useMemo } from 'react'
import { UniwindContext } from '../../core/context'
import { ThemeName, UniwindContextType } from '../../core/types'

type ScopedThemeProps = {
    theme: ThemeName
}

export const ScopedTheme: React.FC<React.PropsWithChildren<ScopedThemeProps>> = ({ theme, children }) => {
    const value = useMemo<UniwindContextType>(() => ({ scopedTheme: theme }), [theme])

    return (
        <UniwindContext.Provider value={value}>
            {children}
        </UniwindContext.Provider>
    )
}
