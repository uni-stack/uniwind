import { useReducer } from 'react'
import { TouchableHighlight as RNTouchableHighlight, TouchableHighlightProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { useUniwindAccent } from '../../hooks/useUniwindAccent.native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const TouchableHighlight = copyComponentProperties(RNTouchableHighlight, (props: TouchableHighlightProps) => {
    const [isPressed, setIsPressed] = useReducer((state: boolean) => !state, false)
    const state = {
        isDisabled: Boolean(props.disabled),
        isPressed,
    } satisfies ComponentState
    const { Component, style } = useStyle(RNTouchableHighlight, props.className, state)
    const underlayColor = useUniwindAccent(props.underlayColorClassName, state)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            underlayColor={props.underlayColor ?? underlayColor}
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

export default TouchableHighlight
