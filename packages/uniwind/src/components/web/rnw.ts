import { Uniwind } from '../../core'
import { UniwindListener } from '../../core/listener'
import { StyleDependency } from '../../types'
import './metro-injected'

type UniwindWithThemes = {
    themes: typeof Uniwind['themes']
}

const addClassNameToRoot = () => {
    if (typeof document === 'undefined') {
        return
    }

    const root = document.documentElement
    ;(Uniwind as unknown as UniwindWithThemes).themes.forEach(theme => root.classList.remove(theme))
    root.classList.add(Uniwind.currentTheme)
}

UniwindListener.subscribe(() => {
    addClassNameToRoot()
}, [StyleDependency.Theme])

addClassNameToRoot()

export const toRNWClassName = (className?: string) =>
    className !== undefined
        ? ({ $$css: true, tailwind: className }) as {}
        : {}
