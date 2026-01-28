import { useEffect, useReducer } from 'react'
import { UniwindListener } from '../../core/listener'
import { UniwindStore } from '../../core/native'
import { ComponentState } from '../../core/types'

export const useStyle = (className: string | undefined, componentProps: Record<string, any>, state?: ComponentState) => {
    'use no memo'
    const [_, rerender] = useReducer(() => ({}), {})
    const styleState = UniwindStore.getStyles(className, componentProps, state)

    useEffect(() => {
        if (__DEV__ || styleState.dependencies.length > 0) {
            const dispose = UniwindListener.subscribe(rerender, styleState.dependencies)

            return dispose
        }
    }, [styleState.dependencySum])

    return styleState.styles
}
