import { ComponentProps, useEffect, useReducer } from 'react'
import { CSSListener, formatColor, getWebStyles } from '../core/web'
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
    const { classNames, generatedProps } = Object.entries(props).reduce((acc, [propName, propValue]) => {
        if (isColorClassProperty(propName)) {
            const colorProp = classToColor(propName)

            if (props[colorProp] !== undefined) {
                return acc
            }

            const className = propValue
            const color = getWebStyles(className).accentColor

            acc.generatedProps[colorProp] = color !== undefined
                ? formatColor(color)
                : undefined
            acc.classNames += `${className} `

            return acc
        }

        if (isClassProperty(propName)) {
            const styleProp = classToStyle(propName)

            acc.generatedProps[styleProp] ??= []
            acc.generatedProps[styleProp][0] = { $$css: true, tailwind: propValue }

            return acc
        }

        if (isStyleProperty(propName)) {
            acc.generatedProps[propName] ??= []
            acc.generatedProps[propName][1] = propValue

            return acc
        }

        return acc
    }, { generatedProps: {} as AnyObject, classNames: '' })

    const [, rerender] = useReducer(() => ({}), {})

    useEffect(() => {
        const dispose = CSSListener.subscribeToClassName(classNames, rerender)

        return dispose
    }, [classNames])

    return (
        <Component
            {...props}
            {...generatedProps}
        />
    )
}

const withManualUniwind = (Component: Component<AnyObject>, options: Record<PropertyKey, OptionMapping>) => (props: AnyObject) => {
    const { generatedProps, classNames } = Object.entries(options).reduce((acc, [propName, option]) => {
        const className = props[option.fromClassName]

        if (className === undefined) {
            return acc
        }

        if (option.styleProperty !== undefined) {
            // If the prop is already defined, we don't want to override it
            if (props[propName] !== undefined) {
                return acc
            }

            const value = getWebStyles(className)[option.styleProperty]
            const transformedValue = value !== undefined && option.styleProperty.toLowerCase().includes('color')
                ? formatColor(value as string)
                : value

            acc.classNames += `${className} `
            acc.generatedProps[propName] = transformedValue

            return acc
        }

        acc.generatedProps[propName] = [{ $$css: true, tailwind: className }, props[propName]]

        return acc
    }, { generatedProps: {} as AnyObject, classNames: '' })

    const [, rerender] = useReducer(() => ({}), {})

    useEffect(() => {
        const dispose = CSSListener.subscribeToClassName(classNames, rerender)

        return dispose
    }, [classNames])

    return (
        <Component
            {...props}
            {...generatedProps}
        />
    )
}
