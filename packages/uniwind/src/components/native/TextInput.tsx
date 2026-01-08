import { useState } from 'react'
import { TextInput as RNTextInput, TextInputProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const TextInput = copyComponentProperties(RNTextInput, (props: TextInputProps) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const state = {
        isDisabled: props.editable === false,
        isFocused,
        isPressed,
    } satisfies ComponentState
    const style = useStyle(props.className, props, state)
    const cursorColor = useStyle(props.cursorColorClassName, props, state).accentColor
    const selectionColor = useStyle(props.selectionColorClassName, props, state).accentColor
    const placeholderTextColor = useStyle(props.placeholderTextColorClassName, props, state).accentColor
    const selectionHandleColor = useStyle(props.selectionHandleColorClassName, props, state).accentColor
    const underlineColorAndroid = useStyle(props.underlineColorAndroidClassName, props, state).accentColor

    return (
        <RNTextInput
            {...props}
            style={[style, props.style]}
            cursorColor={props.cursorColor ?? cursorColor}
            selectionColor={props.selectionColor ?? selectionColor}
            placeholderTextColor={props.placeholderTextColor ?? placeholderTextColor}
            selectionHandleColor={props.selectionHandleColor ?? selectionHandleColor}
            underlineColorAndroid={props.underlineColorAndroid ?? underlineColorAndroid}
            onFocus={event => {
                setIsFocused(true)
                props.onFocus?.(event)
            }}
            onBlur={event => {
                setIsFocused(false)
                props.onBlur?.(event)
            }}
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

export default TextInput
