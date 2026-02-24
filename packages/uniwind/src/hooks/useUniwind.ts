import { useLayoutEffect, useState } from 'react'
import { Uniwind } from '../core'
import { useUniwindContext } from '../core/context'
import { UniwindListener } from '../core/listener'
import { ThemeName } from '../core/types'
import { StyleDependency } from '../types'

export const useUniwind = () => {
    const uniwindContext = useUniwindContext()
    const [theme, setTheme] = useState(Uniwind.currentTheme)
    const [hasAdaptiveThemes, setHasAdaptiveThemes] = useState(Uniwind.hasAdaptiveThemes)

    useLayoutEffect(() => {
        if (uniwindContext.scopedTheme !== null) {
            return
        }

        const dispose = UniwindListener.subscribe(() => {
            setTheme(Uniwind.currentTheme)
            setHasAdaptiveThemes(Uniwind.hasAdaptiveThemes)
        }, [StyleDependency.Theme, StyleDependency.AdaptiveThemes])

        return () => {
            dispose()
        }
    }, [uniwindContext])

    return {
        theme: uniwindContext.scopedTheme ?? theme as ThemeName,
        hasAdaptiveThemes: uniwindContext.scopedTheme !== null ? false : hasAdaptiveThemes,
    }
}
