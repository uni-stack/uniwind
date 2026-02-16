import React from 'react'
import { UniwindContext } from '../../core/context'
import { ThemeName } from '../../core/types'

type ScopedThemeProps = {
    theme: ThemeName
}

export const ScopedTheme: React.FC<React.PropsWithChildren<ScopedThemeProps>> = ({ theme, children }) => {
    return (
        <UniwindContext.Provider value={{ scopedTheme: theme }}>
            {children}
        </UniwindContext.Provider>
    )
}
