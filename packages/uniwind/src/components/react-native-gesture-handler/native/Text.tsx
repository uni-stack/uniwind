import { useState } from 'react'
import { TextProps } from 'react-native'
import { Text as RNGHText } from 'react-native-gesture-handler'
import { ComponentState } from '../../../core/types'
import { useUniwindAccent } from '../../../hooks/useUniwindAccent.native'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

type StyleWithWebkitLineClamp = {
    WebkitLineClamp?: number
}

export const Text = copyComponentProperties(RNGHText, (props: TextProps) => {
    const [isPressed, setIsPressed] = useState(false)
    const state = {
        isPressed,
        isDisabled: Boolean(props.disabled),
    } satisfies ComponentState
    const style = useStyle(props.className, state)
    const selectionColor = useUniwindAccent(props.selectionColorClassName, state)

    return (
        <RNGHText
            {...props}
            style={[style, props.style]}
            selectionColor={props.selectionColor ?? selectionColor}
            numberOfLines={(style as StyleWithWebkitLineClamp).WebkitLineClamp ?? props.numberOfLines}
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

export default Text
