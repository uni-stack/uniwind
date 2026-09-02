import type { ComponentProps } from 'react'
import { useCallback, useLayoutEffect, useReducer } from 'react'
import { isDefined } from '../common/utils'
import { generateDataSet } from '../components/web/generateDataSet'
import { useUniwindContext } from '../core/context'
import { Logger } from '../core/logger'
import { CSSListener, formatColor, getWebStyles } from '../core/web'
import type { AnyObject, Component, OptionMapping, WithUniwind } from './types'
import { classToColor, classToStyle, isClassProperty, isColorClassProperty, isStyleProperty } from './withUniwindUtils'

let warnedOnce = false

const useClassNames = (classNames: string) => {
    const subscribe = useCallback(
        (callback: () => void) => CSSListener.subscribeToClassName(classNames, callback),
        [classNames],
    )
    const getSnapshot = useCallback(
        () => CSSListener.getSnapshot(classNames),
        [classNames],
    )

    const [snapshot, rerender] = useReducer(getSnapshot, undefined, getSnapshot)

    useLayoutEffect(() => {
        if (getSnapshot() !== snapshot) {
            rerender()
        }

        return subscribe(rerender)
    }, [subscribe, getSnapshot])
}

export const withUniwind: WithUniwind = <
    TComponent extends Component,
    TOptions extends Record<keyof ComponentProps<TComponent>, OptionMapping>,
>(
    Component: TComponent,
    options?: TOptions,
) => options
    ? withManualUniwind(Component, options)
    : withAutoUniwind(Component)

const withAutoUniwind = (Component: Component<AnyObject>) => (originalProps: AnyObject) => {
    const uniwindContext = useUniwindContext()
    const props = { ...originalProps }

    const { classNames, generatedProps } = Object.entries(props).reduce((acc, [propName, propValue]) => {
        if (isColorClassProperty(propName)) {
            const colorProp = classToColor(propName)

            delete props[propName]

            if (props[colorProp] !== undefined) {
                return acc
            }

            const className = propValue
            const color = getWebStyles(className, props, uniwindContext).accentColor

            if (__DEV__ && !warnedOnce && isDefined(className) && className.trim() !== '' && color === undefined) {
                warnedOnce = true
                Logger.warn(
                    `className '${className}' was provided to extract accentColor but no color was found. Make sure the className includes a color utility (e.g., 'accent-red-500', 'accent-blue-600'). See https://docs.uniwind.dev/class-names#the-accent-prefix`,
                )
            }

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
            delete props[propName]

            return acc
        }

        if (isStyleProperty(propName)) {
            acc.generatedProps[propName] ??= []
            acc.generatedProps[propName][1] = propValue
            delete props[propName]

            return acc
        }

        return acc
    }, { generatedProps: {} as AnyObject, classNames: '' })

    useClassNames(classNames)

    const dataSet = generateDataSet(props)

    if (dataSet) {
        generatedProps.dataSet = dataSet
    }

    return (
        <Component
            {...props}
            {...generatedProps}
        />
    )
}

const withManualUniwind = (Component: Component<AnyObject>, options: Record<PropertyKey, OptionMapping>) => (originalProps: AnyObject) => {
    const uniwindContext = useUniwindContext()
    const props = { ...originalProps }

    const { generatedProps, classNames } = Object.entries(options).reduce((acc, [propName, option]) => {
        // Read from original props because we're going to delete the prop from cloned props later
        const className = originalProps[option.fromClassName]
        delete props[option.fromClassName]

        if (className === undefined) {
            return acc
        }

        if (option.styleProperty !== undefined) {
            // If the prop is already defined, we don't want to override it
            if (props[propName] !== undefined) {
                return acc
            }

            const value = getWebStyles(className, props, uniwindContext)[option.styleProperty]
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

    useClassNames(classNames)

    const dataSet = generateDataSet(props)

    if (dataSet) {
        generatedProps.dataSet = dataSet
    }

    return (
        <Component
            {...props}
            {...generatedProps}
        />
    )
}
