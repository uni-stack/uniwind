import { useContext, useLayoutEffect, useReducer } from 'react'
import { UniwindContext } from '../core/context'
import { RNStyle } from '../core/types'
import { CSSListener, getWebStyles } from '../core/web'

const emptyState = {} as RNStyle

export const useResolveClassNames = (className: string) => {
    const uniwindContext = useContext(UniwindContext)
    const [styles, recreate] = useReducer(
        () => className !== '' ? getWebStyles(className, uniwindContext) : emptyState,
        className !== '' ? getWebStyles(className, uniwindContext) : emptyState,
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
