import { useState } from 'react'
import {
    TouchableWithoutFeedback as RNGHTouchableWithoutFeedback,
    TouchableWithoutFeedbackProps,
} from 'react-native-gesture-handler'
import { ComponentState } from '../../../core/types'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const TouchableWithoutFeedback = copyComponentProperties(
    RNGHTouchableWithoutFeedback,
    (props: TouchableWithoutFeedbackProps) => {
        const [isPressed, setIsPressed] = useState(false)
        const state = {
            isDisabled: Boolean(props.disabled),
            isPressed,
        } satisfies ComponentState
        const style = useStyle(props.className, state)

        return (
            <RNGHTouchableWithoutFeedback
                {...props}
                style={[style, props.style]}
                onPressIn={() => {
                    setIsPressed(true)
                    props.onPressIn?.()
                }}
                onPressOut={() => {
                    setIsPressed(false)
                    props.onPressOut?.()
                }}
            />
        )
    },
)

export default TouchableWithoutFeedback
