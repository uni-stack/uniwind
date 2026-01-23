import { KeyboardAvoidingView as RNKeyboardAvoidingView, KeyboardAvoidingViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const KeyboardAvoidingView = copyComponentProperties(RNKeyboardAvoidingView, (props: KeyboardAvoidingViewProps) => {
    const { Component, style } = useStyle(RNKeyboardAvoidingView, props.className)
    const contentContainerStyle = useStyle(props.contentContainerClassName)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            contentContainerStyle={[contentContainerStyle, props.contentContainerStyle]}
        />
    )
})

export default KeyboardAvoidingView
