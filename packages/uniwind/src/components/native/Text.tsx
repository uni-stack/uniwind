import { useReducer } from 'react'
import { Text as RNText, TextProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { useUniwindAccent } from '../../hooks/useUniwindAccent.native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

type StyleWithWebkitLineClamp = {
    WebkitLineClamp?: number
}

export const Text = copyComponentProperties(RNText, (props: TextProps) => {
    const [isPressed, setIsPressed] = useReducer((state: boolean) => !state, false)
    const state = {
        isPressed,
        isDisabled: Boolean(props.disabled),
    } satisfies ComponentState
    const { Component, style } = useStyle(RNText, props.className, state)
    const selectionColor = useUniwindAccent(props.selectionColorClassName, state)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            selectionColor={props.selectionColor ?? selectionColor}
            numberOfLines={(style as StyleWithWebkitLineClamp).WebkitLineClamp ?? props.numberOfLines}
            onPressIn={event => {
                setIsPressed()
                props.onPressIn?.(event)
            }}
            onPressOut={event => {
                setIsPressed()
                props.onPressOut?.(event)
            }}
        />
    )
})

export default Text
