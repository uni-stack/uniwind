import { useLayoutEffect, useReducer } from 'react'
import { useUniwindContext } from '../core/context'
import { UniwindListener } from '../core/listener'
import { UniwindStore } from '../core/native'

export const useResolveClassNames = (className: string) => {
    const uniwindContext = useUniwindContext()
    const [uniwindState, recreate] = useReducer(
        () => UniwindStore.getStyles(className, undefined, undefined, uniwindContext),
        UniwindStore.getStyles(className, undefined, undefined, uniwindContext),
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
    }, [uniwindState.dependencySum, className])

    return uniwindState.styles
}
