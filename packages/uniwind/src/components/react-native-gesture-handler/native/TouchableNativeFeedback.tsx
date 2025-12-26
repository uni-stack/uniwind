import { useState } from 'react'
import { TouchableNativeFeedbackProps } from 'react-native'
import { TouchableNativeFeedback as RNGHTouchableNativeFeedback } from 'react-native-gesture-handler'
import { ComponentState } from '../../../core/types'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const TouchableNativeFeedback = copyComponentProperties(
    RNGHTouchableNativeFeedback,
    (props: TouchableNativeFeedbackProps) => {
        const [isPressed, setIsPressed] = useState(false)
        const state = {
            isDisabled: Boolean(props.disabled),
            isPressed,
        } satisfies ComponentState
        const style = useStyle(props.className, state)

        return (
            <RNGHTouchableNativeFeedback
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
    },
)

export default TouchableNativeFeedback
