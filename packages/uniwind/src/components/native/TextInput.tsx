import { useReducer } from 'react'
import { TextInput as RNTextInput, TextInputProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { useUniwindAccent } from '../../hooks/useUniwindAccent.native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const TextInput = copyComponentProperties(RNTextInput, (props: TextInputProps) => {
    const [isFocused, setIsFocused] = useReducer((state: boolean) => !state, false)
    const [isPressed, setIsPressed] = useReducer((state: boolean) => !state, false)
    const state = {
        isDisabled: props.editable === false,
        isFocused,
        isPressed,
    } satisfies ComponentState
    const { Component, style } = useStyle(RNTextInput, props.className, state)
    const cursorColor = useUniwindAccent(props.cursorColorClassName, state)
    const selectionColor = useUniwindAccent(props.selectionColorClassName, state)
    const placeholderTextColor = useUniwindAccent(props.placeholderTextColorClassName, state)
    const selectionHandleColor = useUniwindAccent(props.selectionHandleColorClassName, state)
    const underlineColorAndroid = useUniwindAccent(props.underlineColorAndroidClassName, state)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            cursorColor={props.cursorColor ?? cursorColor}
            selectionColor={props.selectionColor ?? selectionColor}
            placeholderTextColor={props.placeholderTextColor ?? placeholderTextColor}
            selectionHandleColor={props.selectionHandleColor ?? selectionHandleColor}
            underlineColorAndroid={props.underlineColorAndroid ?? underlineColorAndroid}
            onFocus={event => {
                setIsFocused()
                props.onFocus?.(event)
            }}
            onBlur={event => {
                setIsFocused()
                props.onBlur?.(event)
            }}
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

export default TextInput
