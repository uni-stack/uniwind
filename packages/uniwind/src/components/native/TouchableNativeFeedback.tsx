import { useReducer } from 'react'
import { TouchableNativeFeedback as RNTouchableNativeFeedback, TouchableNativeFeedbackProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const TouchableNativeFeedback = copyComponentProperties(RNTouchableNativeFeedback, (props: TouchableNativeFeedbackProps) => {
    const [isPressed, setIsPressed] = useReducer((state: boolean) => !state, false)
    const state = {
        isDisabled: Boolean(props.disabled),
        isPressed,
    } satisfies ComponentState
    const { Component, style } = useStyle(RNTouchableNativeFeedback, props.className, state)

    return (
        <Component
            {...props}
            style={[style, props.style]}
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

export default TouchableNativeFeedback
