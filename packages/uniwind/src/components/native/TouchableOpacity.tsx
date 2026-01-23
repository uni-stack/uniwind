import { useReducer } from 'react'
import { TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const TouchableOpacity = copyComponentProperties(RNTouchableOpacity, (props: TouchableOpacityProps) => {
    const [isPressed, setIsPressed] = useReducer((state: boolean) => !state, false)
    const state = {
        isDisabled: Boolean(props.disabled),
        isPressed,
    } satisfies ComponentState
    const { Component, style } = useStyle(RNTouchableOpacity, props.className, state)

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

export default TouchableOpacity
