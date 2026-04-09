import { useLayoutEffect, useReducer } from 'react'
import { useUniwindContext } from '../../core/context'
import { UniwindListener } from '../../core/listener'
import { UniwindStore } from '../../core/native'
import { ComponentState } from '../../core/types'

export const useStyle = (className: string | undefined, componentProps: Record<string, any>, state?: ComponentState, componentName?: string) => {
    'use no memo'
    const uniwindContext = useUniwindContext()
    const [_, rerender] = useReducer(() => ({}), {})
    const resolvedClassName = componentName !== undefined
        ? className !== undefined
            ? `uniwind-default-${componentName} ${className}`
            : `uniwind-default-${componentName}`
        : className ?? ''
    const styleState = UniwindStore.getStyles(resolvedClassName, componentProps, state, uniwindContext)

    useLayoutEffect(() => {
        if (__DEV__ || styleState.dependencies.length > 0) {
            const dispose = UniwindListener.subscribe(rerender, styleState.dependencies)

            return dispose
        }
    }, [styleState.dependencySum])

    return styleState.styles
}
