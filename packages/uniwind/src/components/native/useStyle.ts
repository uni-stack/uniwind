/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { ComponentType, useEffect, useMemo, useReducer } from 'react'
import { createAnimatedComponent } from 'react-native-reanimated'
import { UniwindListener } from '../../core/listener'
import { UniwindStore } from '../../core/native'
import { ComponentState, RNStyle } from '../../core/types'
import { weakFamily } from '../../core/weak-map'
import { StyleDependency } from '../../types'

const emptyState = {
    styles: {} as RNStyle,
    component: undefined,
    dependencies: [] as Array<StyleDependency>,
}

export function useStyle(className?: string, state?: ComponentState): RNStyle
export function useStyle<T extends React.ComponentType<any>>(
    component: T,
    className?: string,
    state?: ComponentState,
): { style: RNStyle; Component: T }

export function useStyle<T extends React.ComponentType<any>>(
    componentOrClassName: T | string,
    classNameOrState?: string | ComponentState,
    state?: ComponentState,
): RNStyle | { style: RNStyle; Component: T } {
    const [_, rerender] = useReducer(() => ({}), {})

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const isComponentOverload = typeof componentOrClassName !== 'string' && componentOrClassName !== undefined
    const className = isComponentOverload
        ? (classNameOrState as string)
        : (componentOrClassName as string)
    const actualState = isComponentOverload
        ? state
        : (classNameOrState as ComponentState | undefined)

    const styleState = useMemo(
        () =>
            className
                ? UniwindStore.getStyles(className, {
                    isDisabled: actualState?.isDisabled,
                    isFocused: actualState?.isFocused,
                    isPressed: actualState?.isPressed,
                })
                : emptyState,
        [className, _, actualState?.isDisabled, actualState?.isFocused, actualState?.isPressed],
    )

    useEffect(() => {
        if (__DEV__ || styleState.dependencies.length > 0) {
            const dispose = UniwindListener.subscribe(rerender, styleState.dependencies)

            return dispose
        }
    }, [styleState])

    if (!isComponentOverload) {
        return styleState.styles
    }

    return {
        style: styleState.styles,
        Component: isAnimatedComponent(styleState.styles) ? animatedComponentFamily(componentOrClassName) as T : componentOrClassName,
    }
}

export const animatedComponentFamily = weakFamily((component: ComponentType) => {
    if (
        'displayName' in component
        && component.displayName?.startsWith('Animated.')
    ) {
        return component
    }

    return createAnimatedComponent(component)
})

const isAnimatedComponent = (styles: Record<string, any>) => {
    return styles.transitionProperty !== undefined || styles.animationName !== undefined
}
