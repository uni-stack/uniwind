import { ComponentProps, useEffect, useReducer } from 'react'
import { UniwindListener } from '../core/listener'
import { UniwindStore } from '../core/native'
import { StyleDependency } from '../types'
import { AnyObject, Component, OptionMapping, WithUniwind } from './types'
import { classToColor, classToStyle, isClassProperty, isColorClassProperty, isStyleProperty } from './withUniwindUtils'

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
    const { dependencies, generatedProps } = Object.entries(props).reduce((acc, [propName, propValue]) => {
        if (isColorClassProperty(propName)) {
            const colorProp = classToColor(propName)

            if (props[colorProp] !== undefined) {
                return acc
            }

            const { styles, dependencies } = UniwindStore.getStyles(propValue)

            acc.dependencies.push(...dependencies)
            acc.generatedProps[colorProp] = styles.accentColor

            return acc
        }

        if (isClassProperty(propName)) {
            const styleProp = classToStyle(propName)
            const { styles, dependencies } = UniwindStore.getStyles(propValue)

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

    const deps = Array.from(new Set(dependencies))
    const [, rerender] = useReducer(() => ({}), {})

    useEffect(() => {
        const dispose = UniwindListener.subscribe(rerender, deps)

        return dispose
    }, [deps])

    return (
        <Component
            {...props}
            {...generatedProps}
        />
    )
}

const withManualUniwind = (Component: Component<AnyObject>, options: Record<PropertyKey, OptionMapping>) => (props: AnyObject) => {
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

            const { styles, dependencies } = UniwindStore.getStyles(className)

            acc.generatedProps[propName] = styles[option.styleProperty]
            acc.dependencies.push(...dependencies)

            return acc
        }

        const { styles, dependencies } = UniwindStore.getStyles(className)

        acc.generatedProps[propName] = styles
        acc.dependencies.push(...dependencies)

        return acc
    }, { generatedProps: {} as AnyObject, dependencies: [] as Array<StyleDependency> })

    const deps = Array.from(new Set(dependencies))
    const [, rerender] = useReducer(() => ({}), {})

    useEffect(() => {
        const dispose = UniwindListener.subscribe(rerender, deps)

        return dispose
    }, [deps])

    return (
        <Component
            {...props}
            {...generatedProps}
        />
    )
}
