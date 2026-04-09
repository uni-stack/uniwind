import { useState } from 'react'
import { TouchableHighlight as RNTouchableHighlight, TouchableHighlightProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const TouchableHighlight = copyComponentProperties(RNTouchableHighlight, (props: TouchableHighlightProps) => {
    const [isPressed, setIsPressed] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const state = {
        isDisabled: Boolean(props.disabled),
        isPressed,
        isFocused,
    } satisfies ComponentState
    const style = useStyle(props.className, props, state, 'TouchableHighlight')
    const underlayColor = useAccentColor(props.underlayColorClassName, props, state)

    return (
        <RNTouchableHighlight
            {...props}
            style={[style, props.style]}
            underlayColor={props.underlayColor ?? underlayColor}
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

export default TouchableHighlight
