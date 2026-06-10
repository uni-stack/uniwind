import { TextInput as ExpoTextInput, type TextInputProps } from '@expo/ui'
import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { useAccentColor } from '../../../native/useAccentColor'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'

type StyleWithWebkitLineClamp = {
    WebkitLineClamp?: number
}

export const TextInput = copyComponentProperties(ExpoTextInput, (props: TextInputProps) => {
    const [isFocused, setIsFocused] = useState(false)
    const state = {
        isDisabled: props.editable === false || props.readOnly === true,
        isFocused,
    }
    const style = useStyle(props.className, props, state)
    const cursorColor = useAccentColor(props.cursorColorClassName, props, state)
    const placeholderTextColor = useAccentColor(props.placeholderTextColorClassName, props, state)
    const selectionColor = useAccentColor(props.selectionColorClassName, props, state)
    const selectionHandleColor = useAccentColor(props.selectionHandleColorClassName, props, state)

    return (
        <ExpoTextInput
            {...props}
            cursorColor={props.cursorColor ?? cursorColor}
            numberOfLines={props.numberOfLines ?? (style as StyleWithWebkitLineClamp).WebkitLineClamp}
            placeholderTextColor={props.placeholderTextColor ?? placeholderTextColor}
            selectionColor={props.selectionColor ?? selectionColor}
            selectionHandleColor={props.selectionHandleColor ?? selectionHandleColor}
            style={StyleSheet.flatten([style, props.style])}
            textStyle={StyleSheet.flatten([style, props.textStyle]) as TextInputProps['textStyle']}
            onFocus={() => {
                setIsFocused(true)
                props.onFocus?.()
            }}
            onBlur={() => {
                setIsFocused(false)
                props.onBlur?.()
            }}
        />
    )
})
