import { useState } from 'react'
import { TouchableOpacity as RNGHTouchableOpacity, TouchableOpacityProps } from 'react-native-gesture-handler'
import { ComponentState } from '../../../core/types'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const TouchableOpacity = copyComponentProperties(
    RNGHTouchableOpacity,
    (props: TouchableOpacityProps) => {
        const [isPressed, setIsPressed] = useState(false)
        const state = {
            isDisabled: Boolean(props.disabled),
            isPressed,
        } satisfies ComponentState
        const style = useStyle(props.className, state)

        return (
            <RNGHTouchableOpacity
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

export default TouchableOpacity
