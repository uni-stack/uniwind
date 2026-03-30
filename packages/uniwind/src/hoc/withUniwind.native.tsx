import { ComponentProps, useLayoutEffect, useReducer } from 'react'
import { isDefined } from '../common/utils'
import { useUniwindContext } from '../core/context'
import { UniwindListener } from '../core/listener'
import { Logger } from '../core/logger'
import { UniwindStore } from '../core/native'
import { StyleDependency } from '../types'
import { AnyObject, Component, OptionMapping, WithUniwind } from './types'
import { classToColor, classToStyle, isClassProperty, isColorClassProperty, isStyleProperty } from './withUniwindUtils'

let warnedOnce = false

export const withUniwind: WithUniwind = <
    TComponent extends Component,
    TOptions extends Record<keyof ComponentProps<TComponent>, OptionMapping>,
>(
    Component: TComponent,
    options?: TOptions,
) => options
    ? withManualUniwind(Component, options)
    : withAutoUniwind(Component)

const withAutoUniwind = (Component: Component<AnyObject>) => (props: AnyObject) => {
    const uniwindContext = useUniwindContext()
    const { dependencies, generatedProps } = Object.entries(props).reduce((acc, [propName, propValue]) => {
        if (isColorClassProperty(propName)) {
            const colorProp = classToColor(propName)

            if (props[colorProp] !== undefined) {
                return acc
            }

            const { styles, dependencies } = UniwindStore.getStyles(propValue, props, undefined, uniwindContext)

            if (__DEV__ && !warnedOnce && isDefined(propValue) && propValue.trim() !== '' && styles.accentColor === undefined) {
                warnedOnce = true
                Logger.warn(
                    `className '${propValue}' was provided to extract accentColor but no color was found. Make sure the className includes a color utility (e.g., 'accent-red-500', 'accent-blue-600'). See https://docs.uniwind.dev/class-names#the-accent-prefix`,
                )
            }

            acc.dependencies.push(...dependencies)
            acc.generatedProps[colorProp] = styles.accentColor

            return acc
        }

        if (isClassProperty(propName)) {
            const styleProp = classToStyle(propName)
            const { styles, dependencies } = UniwindStore.getStyles(propValue, props, undefined, uniwindContext)

            acc.dependencies.push(...dependencies)
            acc.generatedProps[styleProp] ??= []
            acc.generatedProps[styleProp][0] = styles

            return acc
        }

        if (isStyleProperty(propName)) {
            acc.generatedProps[propName] ??= []
            acc.generatedProps[propName][1] = propValue

            return acc
        }

        return acc
    }, { generatedProps: {} as AnyObject, dependencies: [] as Array<StyleDependency> })

    const dependencySum = dependencies.reduce((acc, dependency) => {
        acc |= 1 << dependency
        return acc
    }, 0)
    const [, rerender] = useReducer(() => ({}), {})

    useLayoutEffect(() => {
        const dispose = UniwindListener.subscribe(rerender, Array.from(new Set(dependencies)))

        return dispose
    }, [dependencySum])

    return (
        <Component
            {...props}
            {...generatedProps}
        />
    )
}

const withManualUniwind = (Component: Component<AnyObject>, options: Record<PropertyKey, OptionMapping>) => (props: AnyObject) => {
    const uniwindContext = useUniwindContext()
    const { generatedProps, dependencies } = Object.entries(options).reduce((acc, [propName, option]) => {
        const className = props[option.fromClassName]

        if (className === undefined) {
            return acc
        }

        if (option.styleProperty !== undefined) {
            // If the prop is already defined, we don't want to override it
            if (props[propName] !== undefined) {
                return acc
            }

            const { styles, dependencies } = UniwindStore.getStyles(className, props, undefined, uniwindContext)

            acc.generatedProps[propName] = styles[option.styleProperty]
            acc.dependencies.push(...dependencies)

            return acc
        }

        const { styles, dependencies } = UniwindStore.getStyles(className, props, undefined, uniwindContext)
        acc.dependencies.push(...dependencies)

        if (!isStyleProperty(propName)) {
            acc.generatedProps[propName] = styles

            return acc
        }

        const existingStyle = props[propName]

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (existingStyle) {
            acc.generatedProps[propName] = [styles, existingStyle]

            return acc
        }

        acc.generatedProps[propName] = styles

        return acc
    }, { generatedProps: {} as AnyObject, dependencies: [] as Array<StyleDependency> })

    const dependencySum = dependencies.reduce((acc, dependency) => {
        acc |= 1 << dependency
        return acc
    }, 0)
    const [, rerender] = useReducer(() => ({}), {})

    useLayoutEffect(() => {
        const dispose = UniwindListener.subscribe(rerender, Array.from(new Set(dependencies)))

        return dispose
    }, [dependencySum])

    return (
        <Component
            {...props}
            {...generatedProps}
        />
    )
}
