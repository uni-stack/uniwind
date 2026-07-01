import React, { useMemo } from 'react'
import type { ViewStyle } from 'react-native'
import { View } from 'react-native'
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
    const style = useMemo<ViewStyle>(() => {
        if (rtl === undefined) {
            return {
                display: 'contents',
            }
        }

        return { display: 'contents', direction: rtl ? 'rtl' : 'ltr' }
    }, [rtl])

    return (
        <View style={style}>
            <UniwindContext.Provider value={value}>
                {children}
            </UniwindContext.Provider>
        </View>
    )
}
