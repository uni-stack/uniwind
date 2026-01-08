import { useState } from 'react'
import { TouchableNativeFeedback as RNTouchableNativeFeedback, TouchableNativeFeedbackProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const TouchableNativeFeedback = copyComponentProperties(RNTouchableNativeFeedback, (props: TouchableNativeFeedbackProps) => {
    const [isPressed, setIsPressed] = useState(false)
    const state = {
        isDisabled: Boolean(props.disabled),
        isPressed,
    } satisfies ComponentState
    const style = useStyle(props.className, props, state)

    return (
        <RNTouchableNativeFeedback
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
        />
    )
})

export default TouchableNativeFeedback
