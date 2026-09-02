import { useLayoutEffect, useReducer } from 'react'
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

const useSnapshot = <T>(subscribe: (callback: () => void) => () => void, getSnapshot: () => T) => {
    const [snapshot, rerender] = useReducer(getSnapshot, undefined, getSnapshot)
    const currentSnapshot = getSnapshot()

    useLayoutEffect(() => {
        if (getSnapshot() !== snapshot) {
            rerender()
        }

        return subscribe(rerender)
    }, [subscribe, getSnapshot])

    return currentSnapshot
}

export const useUniwind = (): { theme: ThemeName; hasAdaptiveThemes: boolean } => {
    const uniwindContext = useUniwindContext()
    const isScoped = uniwindContext.scopedTheme !== null
    const theme = useSnapshot(isScoped ? subscribeToNothing : subscribeToTheme, getTheme)
    const hasAdaptiveThemes = useSnapshot(
        isScoped ? subscribeToNothing : subscribeToAdaptiveThemes,
        getHasAdaptiveThemes,
    )

    return {
        theme: uniwindContext.scopedTheme ?? theme,
        hasAdaptiveThemes: isScoped ? false : hasAdaptiveThemes,
    }
}
