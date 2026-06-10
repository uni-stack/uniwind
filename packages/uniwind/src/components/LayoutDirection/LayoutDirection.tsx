import React, { useMemo } from 'react'
import { UniwindContext, useUniwindContext } from '../../core/context'
import type { UniwindContextType } from '../../core/types'

type LayoutDirectionProps = {
    rtl?: boolean
}

export const LayoutDirection: React.FC<React.PropsWithChildren<LayoutDirectionProps>> = ({ rtl, children }) => {
    const uniwindContext = useUniwindContext()
    const value = useMemo<UniwindContextType>(
        () => rtl === undefined ? uniwindContext : { ...uniwindContext, rtl },
        [uniwindContext, rtl],
    )
    const dir = rtl === undefined ? undefined : rtl ? 'rtl' : 'ltr'

    return (
        <div dir={dir} style={{ display: 'contents' }}>
            <UniwindContext.Provider value={value}>
                {children}
            </UniwindContext.Provider>
        </div>
    )
}
