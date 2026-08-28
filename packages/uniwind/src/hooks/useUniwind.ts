import { useSyncExternalStore } from 'react'
import { StyleDependency } from '../common/consts'
import { Uniwind } from '../core'
import { useUniwindContext } from '../core/context'
import { UniwindListener } from '../core/listener'
import type { ThemeName } from '../core/types'

const subscribeToTheme = (callback: () => void) => UniwindListener.subscribe(callback, [StyleDependency.Theme])
const subscribeToAdaptiveThemes = (callback: () => void) => UniwindListener.subscribe(callback, [StyleDependency.AdaptiveThemes])
const subscribeToNothing = () => () => {}
const getTheme = () => Uniwind.currentTheme
const getHasAdaptiveThemes = () => Uniwind.hasAdaptiveThemes

export const useUniwind = (): { theme: ThemeName; hasAdaptiveThemes: boolean } => {
    const uniwindContext = useUniwindContext()
    const isScoped = uniwindContext.scopedTheme !== null
    const theme = useSyncExternalStore(isScoped ? subscribeToNothing : subscribeToTheme, getTheme, getTheme)
    const hasAdaptiveThemes = useSyncExternalStore(
        isScoped ? subscribeToNothing : subscribeToAdaptiveThemes,
        getHasAdaptiveThemes,
        getHasAdaptiveThemes,
    )

    return {
        theme: uniwindContext.scopedTheme ?? theme,
        hasAdaptiveThemes: isScoped ? false : hasAdaptiveThemes,
    }
}
