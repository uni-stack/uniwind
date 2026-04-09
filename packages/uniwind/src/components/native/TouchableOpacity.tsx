import { useState } from 'react'
import { TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const TouchableOpacity = copyComponentProperties(RNTouchableOpacity, (props: TouchableOpacityProps) => {
    const [isPressed, setIsPressed] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const state = {
        isDisabled: Boolean(props.disabled),
        isPressed,
        isFocused,
    } satisfies ComponentState
    const style = useStyle(props.className, props, state, 'TouchableOpacity')

    return (
        <RNTouchableOpacity
            {...props}
            style={[style, props.style]}
            onPressIn={event => {
                setIsPressed(true)
                props.onPressIn?.(event)
            }}
            onPressOut={event => {
                setIsPressed(false)
                props.onPressOut?.(event)
            }}
            onFocus={event => {
                setIsFocused(true)
                props.onFocus?.(event)
            }}
            onBlur={event => {
                setIsFocused(false)
                props.onBlur?.(event)
            }}
        />
    )
})

export default TouchableOpacity
