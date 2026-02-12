import { useLayoutEffect, useReducer } from 'react'
import { UniwindListener } from '../core/listener'
import { UniwindStore } from '../core/native'

export const useResolveClassNames = (className: string) => {
    const [uniwindState, recreate] = useReducer(
        () => UniwindStore.getStyles(className),
        UniwindStore.getStyles(className),
    )

    useLayoutEffect(() => {
        if (className !== '') {
            recreate()
        }
    }, [className])

    useLayoutEffect(() => {
        if (uniwindState.dependencies.length > 0) {
            const dispose = UniwindListener.subscribe(recreate, uniwindState.dependencies)

            return dispose
        }
    }, [uniwindState.dependencies, className])

    return uniwindState.styles
}
