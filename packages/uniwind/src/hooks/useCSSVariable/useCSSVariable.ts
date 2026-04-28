import { useLayoutEffect, useRef, useState } from 'react'
import { arrayEquals } from '../../common/utils'
import { useUniwindContext } from '../../core/context'
import { UniwindListener } from '../../core/listener'
import { Logger } from '../../core/logger'
import { UniwindContextType } from '../../core/types'
import { StyleDependency } from '../../types'
import { getVariableValue } from './getVariableValue'

let warned = false

const logDevError = (name: string) => {
    warned = true
    Logger.warn(
        `We couldn't find your variable ${name}. Make sure it's used at least once in your className, or define it in a static theme as described in the docs: https://docs.uniwind.dev/api/use-css-variable`,
    )
}

export const getCSSVariable = (name: string | Array<string>, uniwindContext: UniwindContextType) => {
    const value = Array.isArray(name)
        ? name.map(name => getVariableValue(name, uniwindContext))
        : getVariableValue(name, uniwindContext)

    if (Array.isArray(value)) {
        value.forEach((val, index) => {
            if (val === undefined && __DEV__ && !warned) {
                logDevError(name[index] ?? '')
            }
        })
    }

    if (value === undefined && __DEV__ && !warned) {
        logDevError(name as string)
    }

    return value
}

type IsGenericNumber<T> = T & 0 extends -1 ? false : true
type CreateArray<N extends number, Value, TAcc extends Array<Value> = []> = TAcc['length'] extends N ? TAcc : CreateArray<N, Value, [...TAcc, Value]>

export type GetCSSVariable = {
    (name: string): string | number | undefined
    <const T extends Array<string>>(
        names: T,
    ): IsGenericNumber<T['length']> extends true ? Array<string | number | undefined> : CreateArray<T['length'], string | number | undefined>
}

/**
 * A hook that returns the value of a CSS variable.
 * @param name Name / Array of names of the CSS variable.
 * @returns Value / Values of the CSS variable. On web it is always a string (1rem, #ff0000, etc.), but on native it can be a string or a number (16px, #ff0000)
 */
export const useCSSVariable: GetCSSVariable = (name: string | Array<string>) => {
    const uniwindContext = useUniwindContext()
    const [value, setValue] = useState(getCSSVariable(name, uniwindContext))
    const nameRef = useRef(name)

    useLayoutEffect(() => {
        if (Array.isArray(name) && Array.isArray(nameRef.current)) {
            if (arrayEquals(name, nameRef.current)) {
                return
            }

            setValue(getCSSVariable(name, uniwindContext))
            nameRef.current = name

            return
        }

        if (name !== nameRef.current) {
            setValue(getCSSVariable(name, uniwindContext))
            nameRef.current = name
        }
    }, [name])

    useLayoutEffect(() => {
        const updateValue = () => setValue(getCSSVariable(nameRef.current, uniwindContext))
        const dispose = UniwindListener.subscribe(
            updateValue,
            [StyleDependency.Theme, StyleDependency.Variables],
        )

        return dispose
    }, [uniwindContext])

    return value as never
}
