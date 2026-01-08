import { useState } from 'react'
import { Text as RNText, TextProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

type StyleWithWebkitLineClamp = {
    WebkitLineClamp?: number
}

export const Text = copyComponentProperties(RNText, (props: TextProps) => {
    const [isPressed, setIsPressed] = useState(false)
    const state = {
        isPressed,
        isDisabled: Boolean(props.disabled),
    } satisfies ComponentState
    const style = useStyle(props.className, props, state)
    const selectionColor = useStyle(props.selectionColorClassName, props, state).accentColor

    return (
        <RNText
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
