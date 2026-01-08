import { useEffect, useReducer } from 'react'
import { UniwindListener } from '../core/listener'
import { UniwindStore } from '../core/native'
import { RNStyle } from '../core/types'

const emptyState = { styles: {} as RNStyle, dependencies: [] }

export const useResolveClassNames = (className: string) => {
    const [uniwindState, recreate] = useReducer(
        () => className !== '' ? UniwindStore.getStyles(className) : emptyState,
        className !== '' ? UniwindStore.getStyles(className) : emptyState,
    )

    useEffect(() => {
        if (className !== '') {
            recreate()
        }
    }, [className])

    useEffect(() => {
        if (uniwindState.dependencies.length > 0) {
            const dispose = UniwindListener.subscribe(recreate, uniwindState.dependencies)

            return dispose
        }
    }, [uniwindState.dependencies, className])

    return uniwindState.styles
}
