import { useLayoutEffect, useReducer } from 'react'
import { RNStyle } from '../core/types'
import { CSSListener, getWebStyles } from '../core/web'

const emptyState = {} as RNStyle

export const useResolveClassNames = (className: string) => {
    const [styles, recreate] = useReducer(
        () => className !== '' ? getWebStyles(className) : emptyState,
        className !== '' ? getWebStyles(className) : emptyState,
    )

    useLayoutEffect(() => {
        if (className === '') {
            return
        }

        recreate()

        const dispose = CSSListener.subscribeToClassName(className, recreate)

        return dispose
    }, [className])

    return styles
}
