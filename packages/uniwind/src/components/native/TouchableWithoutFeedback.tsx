import { useState } from 'react'
import type { TouchableWithoutFeedbackProps } from 'react-native'
import { TouchableWithoutFeedback as RNTouchableWithoutFeedback } from 'react-native'
import type { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const TouchableWithoutFeedback = copyComponentProperties(RNTouchableWithoutFeedback, (props: TouchableWithoutFeedbackProps) => {
    const [isPressed, setIsPressed] = useState(false)
    const state = {
        isDisabled: Boolean(props.disabled),
        isPressed,
    } satisfies ComponentState
    const style = useStyle(props.className, props, state)

    return (
        <RNTouchableWithoutFeedback
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

export default TouchableWithoutFeedback
